#!/usr/bin/env python3
"""Эмпирический замер: какие computed font-weight реально использует каждая
встроенная семья (для осевых лимитов инстансера) + проверка рендера
(файл://, fonts.check по 4 семьям, ошибки консоли, скриншоты)."""
import json
from playwright.sync_api import sync_playwright

URL = "file://" + os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else "evolution-web-1991-2026.html")
FAMS = ["Unbounded Var", "Manrope Var", "JetBrains Mono Var", "Golos Text Var"]

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    errs, cerrs = [], []
    pg.on("pageerror", lambda e: errs.append(str(e)[:120]))
    pg.on("console", lambda m: cerrs.append(m.text[:120]) if m.type == "error" else None)
    pg.goto(URL)
    pg.wait_for_function("document.fonts.status === 'loaded'", timeout=15000)
    pg.wait_for_timeout(700)

    res = pg.evaluate("""(fams) => {
      const out = {};
      for (const el of document.querySelectorAll('*')) {
        const cs = getComputedStyle(el);
        const fam = fams.find(f => cs.fontFamily.includes(f));
        if (fam) (out[fam] = out[fam] || new Set()).add(cs.fontWeight);
      }
      const o = {};
      for (const k in out) o[k] = [...out[k]].map(Number).sort((a,b)=>a-b);
      return o;
    }""", FAMS)

    # Golos грузится лениво (только в режиме legible) — форсируем
    golos = pg.evaluate("""async () => {
      try { await document.fonts.load("16px 'Golos Text Var'", "Тест Ёё 123"); }
      catch (e) { return "load fail: " + e; }
      return document.fonts.check("16px 'Golos Text Var'") ? "loaded ok" : "check false";
    }""")

    # legible-режим: Golos становится body-шрифтом — меряем его веса
    legible = pg.evaluate("""() => {
      document.documentElement.setAttribute('data-font', 'legible');
      const body = getComputedStyle(document.body).fontFamily;
      const b = getComputedStyle(document.querySelector('strong, b') || document.body).fontWeight;
      document.documentElement.removeAttribute('data-font');
      return {body: body, strongWeight: b};
    }""")

    checks = pg.evaluate("""(fams) => fams.map(f => [f, document.fonts.check("16px '" + f + "'")])""", FAMS)

    print("pageerror:", errs or "нет")
    print("console errors:", cerrs[:3] or "нет")
    print("fonts.check:", checks)
    print("Golos форс-загрузка:", golos)
    print("legible-режим:", legible)
    print("weights per family:", json.dumps(res, ensure_ascii=False))
    pg.screenshot(path=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "screenshots", "dark-hero.png"))
    pg.evaluate("document.getElementById('era1996')?.scrollIntoView() || window.scrollTo(0, innerHeight*2.2)")
    pg.wait_for_timeout(400)
    pg.screenshot(path=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "screenshots", "era-1991.png"))
    b.close()
