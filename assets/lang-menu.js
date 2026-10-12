/* Выпадающее меню языков поверх обычного <select> внутри label.lang.
   Сам select остаётся в странице и прячется: движок языка, как и раньше, слушает его change.
   Цвета страница задаёт переменными --lm-* в :root (у всех есть значения по умолчанию). */
(function () {
  const css = `
  .lm { position: relative; font-family: inherit; }
  .lm svg { display: block; flex: none; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .lm-btn { display: inline-flex; align-items: center; gap: 8px; font: inherit; font-size: 14px; font-weight: 800; line-height: 1.2; padding: 8px 12px; border-radius: 999px; cursor: pointer;
    color: var(--lm-btn-ink, #1b1b1b); background: var(--lm-btn-bg, #fff); border: 1px solid var(--lm-btn-line, rgba(0,0,0,.12));
    -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); transition: border-color .15s, background .15s; }
  .lm-btn:hover { border-color: var(--lm-btn-hover, var(--lm-accent, #2f6fd6)); }
  .lm-btn:focus-visible, .lm-opt:focus-visible { outline: 3px solid var(--lm-focus, var(--lm-accent, #2f6fd6)); outline-offset: 2px; }
  .lm-btn svg { width: 16px; height: 16px; }
  .lm-chev { opacity: .7; transition: transform .2s; }
  .lm.open .lm-chev { transform: rotate(180deg); }
  .lm-panel { position: absolute; z-index: 60; top: calc(100% + 8px); inset-inline-end: 0; min-width: 220px; padding: 6px; border-radius: 16px; text-align: start;
    color: var(--lm-ink, #1b1b1b); background: var(--lm-bg, #fff);
    box-shadow: var(--lm-shadow, 0 24px 50px -18px rgba(15,25,50,.4), 0 0 0 1px rgba(15,25,50,.07));
    opacity: 0; visibility: hidden; transform: translateY(-6px) scale(.98); transform-origin: top right; transition: opacity .16s, transform .16s, visibility 0s .16s; }
  [dir="rtl"] .lm-panel { transform-origin: top left; }
  .lm.open .lm-panel { opacity: 1; visibility: visible; transform: none; transition: opacity .16s, transform .16s, visibility 0s; }
  .lm-h { padding: 8px 12px 6px; font-size: 11px; font-weight: 900; letter-spacing: .14em; text-transform: uppercase; color: var(--lm-muted, #7a7a7a); }
  .lm-list { list-style: none; margin: 0; padding: 0; max-height: min(66vh, 440px); overflow-y: auto; outline: none; }
  .lm-opt { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; cursor: pointer; font-size: 15px; font-weight: 700; line-height: 1.3; white-space: nowrap; }
  .lm-opt:hover, .lm-opt:focus { background: var(--lm-hover, rgba(0,0,0,.05)); outline: none; }
  .lm-opt[aria-selected="true"] { color: var(--lm-accent, #2f6fd6); background: var(--lm-accent-bg, rgba(47,111,214,.1)); font-weight: 900; }
  .lm-code { margin-inline-start: auto; font-size: 11px; font-weight: 900; letter-spacing: .08em; color: var(--lm-muted, #7a7a7a); }
  .lm-opt svg { display: none; width: 16px; height: 16px; margin-inline-start: auto; stroke-width: 2.4; }
  .lm-opt[aria-selected="true"] .lm-code { display: none; }
  .lm-opt[aria-selected="true"] svg { display: block; }
  @media (prefers-reduced-motion: reduce) { .lm-panel, .lm-chev { transition: none; } }`;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const GLOBE = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>';
  const CHEV = '<svg class="lm-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  const valueProp = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
  let uid = 0;

  document.querySelectorAll("label.lang select").forEach((sel) => {
    const label = sel.closest("label.lang");
    const id = `lm-${++uid}`;
    const root = document.createElement("div");
    root.className = "lm";
    root.innerHTML = `<button type="button" class="lm-btn" aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}">${GLOBE}<span class="lm-cur"></span>${CHEV}</button>
      <div class="lm-panel"><div class="lm-h" aria-hidden="true"></div><ul class="lm-list" id="${id}" role="listbox"></ul></div>`;
    label.after(root);
    label.style.display = "none";

    const btn = root.querySelector(".lm-btn");
    const cur = root.querySelector(".lm-cur");
    const head = root.querySelector(".lm-h");
    const list = root.querySelector(".lm-list");
    list.innerHTML = [...sel.options].map((o) =>
      `<li class="lm-opt" role="option" tabindex="-1" data-v="${o.value}" lang="${o.value}"><span>${o.text}</span><span class="lm-code">${o.value.toUpperCase()}</span>${CHECK}</li>`).join("");
    const opts = [...list.children];

    function sync() {
      const v = valueProp.get.call(sel);
      opts.forEach((li) => li.setAttribute("aria-selected", String(li.dataset.v === v)));
      cur.textContent = sel.selectedOptions[0] ? sel.selectedOptions[0].text : v;
      const name = sel.getAttribute("aria-label") || "Language";
      btn.setAttribute("aria-label", `${name}: ${cur.textContent}`);
      list.setAttribute("aria-label", name);
      head.textContent = name;
    }
    // движок ставит язык через sel.value = …, поэтому подписываемся и на это
    Object.defineProperty(sel, "value", { configurable: true, get() { return valueProp.get.call(this); }, set(v) { valueProp.set.call(this, v); sync(); } });
    sel.addEventListener("change", sync);

    const isOpen = () => root.classList.contains("open");
    function open() {
      sync();
      root.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
      (opts.find((li) => li.getAttribute("aria-selected") === "true") || opts[0]).focus();
    }
    function close(focusBtn) {
      if (!isOpen()) return;
      root.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      if (focusBtn) btn.focus();
    }
    function choose(li) {
      const changed = li.dataset.v !== valueProp.get.call(sel);
      close(true);
      if (!changed) return;
      valueProp.set.call(sel, li.dataset.v);
      sel.dispatchEvent(new Event("change", { bubbles: true }));
    }

    btn.addEventListener("click", () => (isOpen() ? close(false) : open()));
    btn.addEventListener("keydown", (e) => {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); open(); }
    });
    list.addEventListener("click", (e) => { const li = e.target.closest(".lm-opt"); if (li) choose(li); });
    list.addEventListener("keydown", (e) => {
      const i = opts.indexOf(document.activeElement);
      const go = (n) => { e.preventDefault(); opts[(n + opts.length) % opts.length].focus(); };
      if (e.key === "ArrowDown") go(i + 1);
      else if (e.key === "ArrowUp") go(i - 1);
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(opts.length - 1);
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (i >= 0) choose(opts[i]); }
      else if (e.key === "Escape") { e.preventDefault(); close(true); }
      else if (e.key === "Tab") close(false);
    });
    document.addEventListener("pointerdown", (e) => { if (!root.contains(e.target)) close(false); });
    sync();
  });
})();
