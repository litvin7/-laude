// Cloudflare Worker: раздаёт сайт и принимает заявки на /api/lead, пересылая их в Telegram.
// Токен бота и chat id хранятся в секретах Worker (BOT_TOKEN, CHAT_ID), а не в коде сайта.

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

async function handleLead(request, env) {
  if (request.method !== "POST") return json({ ok: false, error: "method" }, 405);
  let text = "", photo = null;
  const type = request.headers.get("Content-Type") || "";
  try {
    if (type.includes("multipart/form-data")) {
      const fd = await request.formData();
      text = String(fd.get("text") || "");
      const f = fd.get("photo");
      if (f && typeof f === "object" && f.size > 0) photo = f;
    } else {
      text = String((await request.json()).text || "");
    }
  } catch { return json({ ok: false, error: "bad body" }, 400); }
  text = text.slice(0, 3500);
  if (!text.trim()) return json({ ok: false, error: "empty" }, 400);
  if (photo && photo.size > 10 * 1024 * 1024) return json({ ok: false, error: "photo too big" }, 413);

  const api = (m) => `https://api.telegram.org/bot${env.BOT_TOKEN}/${m}`;
  const tg = await fetch(api("sendMessage"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: env.CHAT_ID, text: "🆕 Новая заявка с сайта\n\n" + text }),
  });
  const ok = tg.ok && (await tg.json()).ok;
  if (ok && photo) {
    const out = new FormData();
    out.append("chat_id", env.CHAT_ID);
    out.append("caption", "🖼 Фото к заявке выше");
    out.append("document", photo, photo.name || "photo.jpg");
    await fetch(api("sendDocument"), { method: "POST", body: out });
  }
  return json({ ok }, ok ? 200 : 502);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/lead") return handleLead(request, env);
    return env.ASSETS.fetch(request);
  },
};
