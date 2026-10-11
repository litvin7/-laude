/* Общий движок для страниц Peep & Peak: языки, ссылки на Instagram, переключатель языка.
   Страница перед подключением задаёт window.I18N = { en: {...}, ru: {...}, ... }
   и при желании window.onLang = (t, code) => { ... } для своих динамических блоков. */
(function () {
  const SITE = {
    instagram: "peepandpeak",
    telegramChannel: "https://t.me/peeppeak",
    youtube: "https://www.youtube.com/@peepandpeak",
    tiktok: "https://www.tiktok.com/@peepandpeak",
    defaultLang: "en",
  };
  const LANGS = [
    { code: "en", name: "English" },
    { code: "zh", name: "中文", font: "Noto Sans SC" },
    { code: "hi", name: "हिन्दी", font: "Noto Sans Devanagari" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "ar", name: "العربية", font: "Noto Sans Arabic", rtl: true },
    { code: "bn", name: "বাংলা", font: "Noto Sans Bengali" },
    { code: "pt", name: "Português" },
    { code: "ru", name: "Русский" },
  ];
  const LINKS = {
    ig: `https://ig.me/m/${SITE.instagram}`,
    profile: `https://instagram.com/${SITE.instagram}`,
    tg: SITE.telegramChannel,
    yt: SITE.youtube,
    tt: SITE.tiktok,
  };
  window.SITE = SITE;
  window.SITE_LINKS = LINKS;

  const $$ = (s) => [...document.querySelectorAll(s)];
  $$("[data-link]").forEach((a) => {
    a.href = LINKS[a.dataset.link];
    a.target = "_blank";
    a.rel = "noopener";
  });
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  const fonts = new Set();
  function loadFont(family) {
    if (!family || fonts.has(family)) return;
    fonts.add(family);
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@400;700;900&display=swap`;
    document.head.appendChild(l);
  }

  function apply(t) {
    $$("[data-i18n]").forEach((el) => { if (t[el.dataset.i18n] != null) el.textContent = t[el.dataset.i18n]; });
    $$("[data-i18n-html]").forEach((el) => { if (t[el.dataset.i18nHtml] != null) el.innerHTML = t[el.dataset.i18nHtml]; });
    $$("[data-i18n-aria]").forEach((el) => { if (t[el.dataset.i18nAria] != null) el.setAttribute("aria-label", t[el.dataset.i18nAria]); });
    $$("[data-i18n-alt]").forEach((el) => { if (t[el.dataset.i18nAlt] != null) el.alt = t[el.dataset.i18nAlt]; });
  }

  function setLang(code, save) {
    const dict = window.I18N || {};
    const lang = LANGS.find((l) => l.code === code && dict[l.code]) || LANGS.find((l) => dict[l.code]);
    const t = dict[lang.code];
    const root = document.documentElement;
    root.lang = lang.code;
    root.dir = lang.rtl ? "rtl" : "ltr";
    loadFont(lang.font);
    const base = getComputedStyle(root).getPropertyValue("--font-base").trim() || '"Nunito", system-ui, sans-serif';
    root.style.setProperty("--font", lang.font ? `${base.split(",")[0]}, "${lang.font}", system-ui, sans-serif` : base);
    if (t.title) document.title = t.title;
    const md = document.querySelector('meta[name="description"]');
    if (md && t.desc) md.content = t.desc;
    apply(t);
    if (typeof window.onLang === "function") window.onLang(t, lang.code);
    $$(".lang-select").forEach((s) => (s.value = lang.code));
    if (save) { try { localStorage.setItem("lang", lang.code); } catch (e) {} }
  }

  function detect() {
    const ok = LANGS.map((l) => l.code).filter((c) => (window.I18N || {})[c]);
    const q = new URLSearchParams(location.search).get("lang");
    if (ok.includes(q)) return q;
    try { const s = localStorage.getItem("lang"); if (ok.includes(s)) return s; } catch (e) {}
    for (const l of navigator.languages || [navigator.language || ""]) {
      const b = String(l).toLowerCase().split("-")[0];
      if (ok.includes(b)) return b;
    }
    return SITE.defaultLang;
  }

  $$(".lang-select").forEach((sel) => {
    sel.innerHTML = LANGS.filter((l) => (window.I18N || {})[l.code]).map((l) => `<option value="${l.code}">${l.name}</option>`).join("");
    sel.addEventListener("change", (e) => setLang(e.target.value, true));
  });
  window.setLang = setLang;
  setLang(detect(), false);
})();
