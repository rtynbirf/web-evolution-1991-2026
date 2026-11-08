/* ─── Эволюция Веба 1991→2026 · единый файл · vanilla JS ─── */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  /* ── Тема ── */
  var themeBtn = document.getElementById("themeBtn");
  function theme() {
    return root.classList.contains("dark") ? "dark" : root.classList.contains("light") ? "light" : null;
  }
  function setTheme(t) {
    root.classList.remove("dark", "light");
    root.classList.add(t);
    store.set("ev-theme", t);
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      setTheme(theme() === "dark" ? "light" : "dark");
      passport();
    });
  }

  /* ── Шапка при прокрутке ── */
  var header = document.getElementById("siteHeader");
  var toTop = document.getElementById("toTop");
  var onScroll = function () {
    if (header) header.classList.toggle("scrolled", window.scrollY > 24);
    if (toTop) toTop.classList.toggle("show", window.scrollY > 600);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: root.dataset.motion === "off" ? "auto" : "smooth" });
    });
  }

  /* ── Бегущая строка: 14 трендов × 2 ряда ── */
  var TRENDS = ["ТАБЛИЦЫ","FLASH","WEB 2.0","СКЕВОМОРФИЗМ","RESPONSIVE","FLAT","MATERIAL","VARIABLE FONTS","DARK MODE","ГЛАССМОРФИЗМ","НЕО-БРУТАЛИЗМ","BENTO","КИНЕТИКА","AI-UI"];
  var r1 = document.getElementById("mqRow1"), r2 = document.getElementById("mqRow2");
  if (r1 && r2) {
    var rowHTML = TRENDS.map(function (t) {
      return '<span class="t">' + t + '</span><i aria-hidden="true">✦</i>';
    }).join("");
    r1.innerHTML = rowHTML;
    r2.innerHTML = rowHTML;
  }

  /* ── Вкладки эпох: синхронизация aria-selected ── */
  var eraRadios = document.querySelectorAll(".tm input[type=radio]");
  Array.prototype.forEach.call(eraRadios, function (radio) {
    radio.addEventListener("change", function () {
      Array.prototype.forEach.call(eraRadios, function (r) {
        var label = document.querySelector('.tm-tabs [for="' + r.id + '"]');
        if (label) label.setAttribute("aria-selected", r.checked ? "true" : "false");
      });
    });
  });

  /* ── Появление при скролле ── */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "-60px 0px" });
    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add("in"); });
  }

  /* ── Панель комфорта ── */
  var fab = document.getElementById("comfortFab");
  var panel = document.getElementById("comfortPanel");
  function panelOpen() { return panel && panel.classList.contains("open"); }
  function setPanel(open) {
    if (!panel) return;
    panel.classList.toggle("open", open);
    if (fab) fab.setAttribute("aria-expanded", open ? "true" : "false");
  }
  if (fab && panel) {
    fab.addEventListener("click", function () { setPanel(!panelOpen()); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panelOpen()) setPanel(false);
    });
    document.addEventListener("click", function (e) {
      if (panelOpen() && !panel.contains(e.target) && e.target !== fab) setPanel(false);
    });
    var hp = document.getElementById("healthOpenPanel");
    if (hp) hp.addEventListener("click", function () { setPanel(true); panel.scrollIntoView === undefined || panel.scrollIntoView({ block: "nearest" }); });
  }

  /* ── Размер текста: 100 → 110 → 125 → 100 ── */
  var fsBtn = document.getElementById("fsBtn");
  var FS = { "": "100%", "2": "110%", "3": "125%" };
  function fsNow() { return root.dataset.fs || ""; }
  function fsLabel() { return FS[fsNow()] || "100%"; }
  if (fsBtn) {
    fsBtn.textContent = fsLabel();
    fsBtn.addEventListener("click", function () {
      var next = fsNow() === "" ? "2" : fsNow() === "2" ? "3" : "";
      if (next) { root.dataset.fs = next; store.set("ev-fs", next); }
      else { delete root.dataset.fs; store.del("ev-fs"); }
      fsBtn.textContent = fsLabel();
      passport();
    });
  }

  /* ── Меньше движения ── */
  var motionBtn = document.getElementById("motionBtn");
  function motionNow() { return root.dataset.motion === "off"; }
  function drawMotion() {
    if (!motionBtn) return;
    motionBtn.setAttribute("aria-pressed", motionNow() ? "true" : "false");
    motionBtn.textContent = motionNow() ? "Вкл" : "Выкл";
  }
  if (motionBtn) {
    drawMotion();
    motionBtn.addEventListener("click", function () {
      if (motionNow()) { delete root.dataset.motion; store.del("ev-motion"); }
      else { root.dataset.motion = "off"; store.set("ev-motion", "off"); }
      drawMotion();
    });
  }

  /* ── Высокий контраст ── */
  var contrastBtn = document.getElementById("contrastBtn");
  function contrastNow() { return root.dataset.contrast === "high"; }
  function drawContrast() {
    if (!contrastBtn) return;
    contrastBtn.setAttribute("aria-pressed", contrastNow() ? "true" : "false");
    contrastBtn.textContent = contrastNow() ? "Вкл" : "Выкл";
  }
  if (contrastBtn) {
    drawContrast();
    contrastBtn.addEventListener("click", function () {
      if (contrastNow()) { delete root.dataset.contrast; store.del("ev-contrast"); }
      else { root.dataset.contrast = "high"; store.set("ev-contrast", "high"); }
      drawContrast();
      passport();
    });
  }

  /* ── Шрифт чтения: Golos Text ── */
  var fontBtn = document.getElementById("fontBtn");
  function fontNow() { return root.dataset.font === "legible"; }
  function drawFont() {
    if (!fontBtn) return;
    fontBtn.setAttribute("aria-pressed", fontNow() ? "true" : "false");
    fontBtn.textContent = "Golos Text";
  }
  if (fontBtn) {
    drawFont();
    fontBtn.addEventListener("click", function () {
      if (fontNow()) { delete root.dataset.font; store.del("ev-font"); }
      else { root.dataset.font = "legible"; store.set("ev-font", "legible"); }
      drawFont();
      passport();
    });
  }
  if (store.get("ev-font") === "legible") root.dataset.font = "legible";

  /* ── Эко-режим: гасит тени, стекло и декоративные градиенты ── */
  var ecoBtn = document.getElementById("ecoBtn");
  function ecoNow() { return root.dataset.eco === "on"; }
  function drawEco() {
    if (!ecoBtn) return;
    ecoBtn.setAttribute("aria-pressed", ecoNow() ? "true" : "false");
    ecoBtn.textContent = ecoNow() ? "Вкл" : "Выкл";
  }
  if (ecoBtn) {
    drawEco();
    ecoBtn.addEventListener("click", function () {
      if (ecoNow()) { delete root.dataset.eco; store.del("ev-eco"); }
      else { root.dataset.eco = "on"; store.set("ev-eco", "on"); }
      drawEco();
      passport();
    });
  }

  /* ── Паспорт страницы: живой аудит из computed style ── */
  /* oklch() / rgb() / hex → линейный sRGB → формула WCAG 2.2 */
  function linSrgb(c) { return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function parseColor(str) {
    var m = String(str).match(/^oklch\(([\d.]+%?)\s+([\d.]+)\s+(-?[\d.]+)/);
    if (m) {
      var L = m[1].charAt(m[1].length - 1) === "%" ? parseFloat(m[1]) / 100 : parseFloat(m[1]);
      var C = parseFloat(m[2]), H = parseFloat(m[3]) * Math.PI / 180;
      var a = C * Math.cos(H), b = C * Math.sin(H);
      var l_ = L + 0.3963377774 * a + 0.2158037573 * b;
      var m_ = L - 0.1055613458 * a - 0.0638541728 * b;
      var s_ = L - 0.0894841775 * a - 1.2914855480 * b;
      var l3 = Math.pow(l_, 3), m3 = Math.pow(m_, 3), s3 = Math.pow(s_, 3);
      return [
        4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
        -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
        -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3
      ];
    }
    m = String(str).match(/^rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
    if (m) return [1, 2, 3].map(function (i) { return linSrgb(parseFloat(m[i]) / 255); });
    m = String(str).match(/^#([0-9a-f]{6})$/i);
    if (m) { var n = parseInt(m[1], 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255].map(linSrgb); }
    return null;
  }
  function wcagRatio(fg, bg) {
    var f = parseColor(fg), b = parseColor(bg);
    if (!f || !b) return null;
    function Y(c) {
      var cl = c.map(function (v) { return Math.max(0, Math.min(1, v)); });
      return 0.2126 * cl[0] + 0.7152 * cl[1] + 0.0722 * cl[2];
    }
    var y1 = Y(f), y2 = Y(b);
    return (Math.max(y1, y2) + 0.05) / (Math.min(y1, y2) + 0.05);
  }
  function setP(id, text, ok) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    if (ok !== undefined) el.dataset.ok = ok ? "1" : "0";
  }
  function passport() {
    var lead = document.querySelector(".lead");
    if (!lead) return;
    var cs = getComputedStyle(lead), csb = getComputedStyle(document.body);
    var fsPx = parseFloat(cs.fontSize);
    setP("pFs", Math.round(fsPx) + " px");
    var lh = parseFloat(cs.lineHeight);
    if (!isNaN(lh)) {
      var rel = lh < 10 ? lh : lh / fsPx;
      setP("pLh", rel.toFixed(2), rel >= 1.5);
    }
    var cv = document.createElement("canvas").getContext("2d");
    cv.font = cs.fontSize + " " + cs.fontFamily;
    var zero = cv.measureText("0").width || fsPx * 0.5;
    setP("pCh", Math.round(lead.clientWidth / zero) + " зн.");
    var cr = wcagRatio(csb.color, csb.backgroundColor);
    if (cr !== null) setP("pCr", cr.toFixed(1) + ":1", cr >= 4.5);
    var fab = document.getElementById("comfortFab");
    if (fab) {
      var cf = getComputedStyle(fab);
      var cc = wcagRatio(cf.color, cf.backgroundColor);
      if (cc !== null) setP("pCc", cc.toFixed(1) + ":1", cc >= 4.5);
    }
    setP("pW", Math.round(document.documentElement.outerHTML.length / 1024) + " КБ");
  }

  /* ── Время суток: вечерний/ночной сдвиг палитры + обновление паспорта ── */
  function hourMode() {
    var h = new Date().getHours();
    root.dataset.hour = (h >= 23 || h < 6) ? "night" : (h >= 20) ? "evening" : "day";
    passport();
  }
  hourMode();
  setInterval(hourMode, 60000);
  window.addEventListener("resize", function () { passport(); });

  /* ── Alt+T: смена темы с клавиатуры (работает и в русской раскладке) ── */
  document.addEventListener("keydown", function (e) {
    if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === "KeyT") {
      setTheme(theme() === "dark" ? "light" : "dark");
      passport();
    }
  });

  /* ── Scrollspy: aria-current у активного пункта навигации ── */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".main-nav a"));
  var navById = {};
  navLinks.forEach(function (a) { navById[a.getAttribute("href").slice(1)] = a; });
  var spyTargets = Object.keys(navById).map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if ("IntersectionObserver" in window && spyTargets.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          navLinks.forEach(function (a) { a.removeAttribute("aria-current"); });
          navById[en.target.id].setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    spyTargets.forEach(function (s) { spy.observe(s); });
  }

  /* ── Сброс ── */
  var resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      ["ev-theme", "ev-motion", "ev-contrast", "ev-eco", "ev-fs", "ev-font"].forEach(store.del);
      delete root.dataset.motion; delete root.dataset.contrast; delete root.dataset.eco; delete root.dataset.fs; delete root.dataset.font;
      setTheme(window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
      drawMotion(); drawContrast(); drawFont(); drawEco();
      if (fsBtn) { delete root.dataset.fs; fsBtn.textContent = fsLabel(); }
      hourMode();
    });
  }
})();
