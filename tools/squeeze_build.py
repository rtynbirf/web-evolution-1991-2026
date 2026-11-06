#!/usr/bin/env python3
"""Дожим single-file HTML «Эволюция Веба 1991→2026» (v5-squeeze).

Три слоя сжатия, всё проверяемо:
  1. Шрифты: ресабсет С ОРИГИНАЛОВ под точный чарсет документа
     (+буфер: полная кириллица, типографская пунктуация), обрезка
     GSUB-фич (aalt/ss01-04/frac/subs/...), hinting, имя-таблиц. Оси wght живы.
  2. CSS: lightningcss minify (без даунгрейда синтаксиса, oklch/color-mix живы).
  3. JS: @swc/core minify, mangle=false (inline-хендлеры), строки целы.
  + HTML: комментарии, отступы, пустые строки (pre/textarea нет — проверено).
Итог собирается заново в download/evolution-web-1991-2026.html + интриджек-проверки.
"""
import base64
import gzip
import os
import re
import subprocess
import sys
import zipfile
from io import BytesIO

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOLS = os.path.dirname(os.path.abspath(__file__))
SINGLE = os.path.join(ROOT, "src")
FONTS_SRC = os.path.join(ROOT, "fonts")           # оригиналы (полные)
OUT = os.path.join(ROOT, "evolution-web-1991-2026.html")
ZIP = os.path.join(ROOT, "evolution-web-1991-2026.zip")

# (семья, файл, descriptor @font-face, лимит оси wght)
# Лимиты — из эмпирического замера computed-весов (probe_weights.py) ±100 буфер:
#   Unbounded 600–800 → 500–900, Manrope 400–700 → 300–800,
#   JetBrains 400–700 → 300–800, Golos — опциональный режим legible,
#   наследует веса до 800 → ось не режем.
FONTS = [
    ("Unbounded", "Unbounded-Variable.woff2", "500 900", (500, 900)),
    ("Manrope", "Manrope-Variable.woff2", "300 800", (300, 800)),
    ("JetBrains Mono", "JetBrainsMono-Variable.woff2", "300 800", (300, 800)),
    ("Golos Text", "GolosText-Variable.woff2", "400 900", None),
]
# GSUB/GPOS-фичи, без которых рендер кириллицы/латиницы не меняется
KEEP_FEATURES = ["ccmp", "locl", "liga", "calt", "rlig", "case", "kern", "mark", "mkmk"]


def read(path: str) -> str:
    with open(path, encoding="utf-8") as fh:
        return fh.read()


def main() -> None:
    parts = {n: read(os.path.join(SINGLE, n)) for n in
             ("head.html", "style_b.html", "style_c.html", "body1.html", "body2.html", "body3.html")}
    appjs = read(os.path.join(SINGLE, "app.js"))
    old_size = os.path.getsize(OUT)

    # ── 1. Чарсет документа + буфер ──────────────────────────────────────────
    all_text = "".join(parts.values()) + appjs
    doc_used = {c for c in set(all_text) if ord(c) >= 0x20 and not c.isspace() or c == " "}
    buf = set("«»…—–’‘“”•№₽€−°©®·×÷") | {"Ё", "ё"} | {chr(c) for c in range(0x0410, 0x0450)}
    target = doc_used | buf
    unicodes = sorted({ord(c) for c in target})
    assert not any("<pre" in t or "<textarea" in t for t in parts.values()), "pre/textarea — отступы нельзя срезать"

    # ── 2. Ресабсет шрифтов ─────────────────────────────────────────────────
    font_b64, font_stats = {}, []
    from fontTools.varLib import instancer
    for fam, fname, weights, axis in FONTS:
        # recalcTimestamp=False: иначе head.modified штампуется временем сборки
        # и пересборка не байт-в-байт (урок TH-WE-01)
        f = TTFont(os.path.join(FONTS_SRC, fname), recalcTimestamp=False)
        opts = subset.Options()
        opts.flavor = "woff2"
        opts.layout_features = KEEP_FEATURES
        opts.hinting = False
        opts.desubroutinize = True
        opts.name_IDs = [1, 2, 4, 6]
        opts.drop_tables += ["BASE"]
        ss = subset.Subsetter(opts)
        ss.populate(unicodes=unicodes)
        ss.subset(f)
        if axis:  # осевой дожим ПОСЛЕ сабсета (обход баги ленивого gvar)
            instancer.instantiateVariableFont(f, {"wght": axis}, inplace=True)
        f.flavor = "woff2"
        bio = BytesIO()
        f.save(bio)
        raw = bio.getvalue()
        b64 = base64.b64encode(raw).decode("ascii")
        font_b64[fam] = b64
        cmap = set(f.getBestCmap().keys())
        missing = [c for c in sorted(doc_used) if ord(c) in unicodes and ord(c) not in cmap]
        font_stats.append((fam, os.path.getsize(os.path.join(FONTS_SRC, fname)), len(raw), len(b64), missing))

    # ── 3. CSS через lightningcss ────────────────────────────────────────────
    head = parts["head.html"]
    head_pre, head_css = head.split("<style>", 1)
    css_c, head_tail = parts["style_c.html"].rsplit("</style>", 1)
    css_raw = head_css.replace("{{FONT_CSS}}", "") + parts["style_b.html"] + css_c
    p = subprocess.run(["node", os.path.join(TOOLS, "min_css.cjs")],
                       input=css_raw.encode(), capture_output=True)
    if p.returncode == 0 and p.stdout:
        css_min = p.stdout.decode()
    else:
        print("⚠ CSS minify fail, оставляю как есть:", p.stderr.decode()[:200])
        css_min = css_raw

    # ── 4. JS через swc ──────────────────────────────────────────────────────
    p = subprocess.run(["node", os.path.join(TOOLS, "min_js.cjs")],
                       input=appjs.encode(), capture_output=True)
    if p.returncode == 0 and p.stdout:
        js_min = p.stdout.decode()
    else:
        print("⚠ JS minify fail, оставляю как есть:", p.stderr.decode()[:200])
        js_min = appjs

    # ── 5. Чистка HTML ───────────────────────────────────────────────────────
    def clean(s: str) -> str:
        s = re.sub(r"<!--.*?-->", "", s, flags=re.S)
        lines = [re.sub(r"^[ \t]+", "", ln.rstrip()) for ln in s.split("\n")]
        return "\n".join(ln for ln in lines if ln)

    head_pre_c = clean(head_pre)
    bodies = "\n".join(clean(parts[n]) for n in ("body1.html", "body2.html", "body3.html"))

    # ── 6. Сборка ────────────────────────────────────────────────────────────
    faces = []
    for fam, fname, weights, axis in FONTS:
        faces.append(
            "@font-face{font-family:'%s Var';src:url(data:font/woff2;base64,%s) format('woff2');"
            "font-weight:%s;font-style:normal;font-display:swap;}" % (fam, font_b64[fam], weights)
        )
    html = (head_pre_c + "<style>" + "\n".join(faces) + css_min + "</style>" + head_tail.strip()
            + "\n" + bodies + "\n" + js_min + "\n</script>\n</body>\n</html>\n")
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(html)

    # ── 7. Проверки ──────────────────────────────────────────────────────────
    ok = True
    checks = {
        "DOCTYPE в начале": html.lstrip().startswith("<!DOCTYPE html>"),
        "закрыт </html> в конце": html.rstrip().endswith("</html>"),
        "нет {{FONT_CSS}}": "{{FONT_CSS}}" not in html,
        "нет src=\"http": 'src="http' not in html,
        "нет @import": "@import" not in html,
        "нет url(http": "url(http" not in html,
        "ровно один </head>": html.count("</head>") == 1,
        "ровно один <style>": html.count("<style>") == 1,
        "4 @font-face": html.count("@font-face") == 4,
    }
    for k, v in checks.items():
        print(("  ✓ " if v else "  ✗ ") + k)
        ok &= v
    data = html.encode()
    gz = len(gzip.compress(data, 9))
    new_size = os.path.getsize(OUT)

    print("\n── Шрифты ──")
    for fam, orig, raw, b64, missing in font_stats:
        print(f"  {fam:<14} orig {orig/1024:6.1f}К → raw {raw/1024:5.1f}К → b64 {b64/1024:6.1f}К"
              + ("" if not missing else f"  [фолбэк-символы: {''.join(missing)}]"))
    fonts_b64_total = sum(len(base64.b64decode(font_b64[f])) for f in font_b64)
    fonts_b64 = sum(len(font_b64[f]) for f in font_b64)
    print(f"  Σ шрифты b64: {fonts_b64/1024:.1f} КБ (было 280.1)")
    print("\n── Размер ──")
    print(f"  HTML+CSS+JS: {len(data)-fonts_b64:,} байт")
    print(f"  Итого: {old_size/1024:.0f} КБ → {new_size/1024:.0f} КБ  ({(1-new_size/old_size)*100:.0f}% срезано)")
    print(f"  gzip -9 при раздаче: {gz/1024:.0f} КБ")
    with open(ZIP, "wb") as fh:
        with zipfile.ZipFile(fh, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
            z.write(OUT, os.path.basename(OUT))
    print(f"  zip-фолбэк: {os.path.getsize(ZIP)/1024:.0f} КБ")
    if not ok:
        sys.exit(1)


if __name__ == "__main__":
    main()
