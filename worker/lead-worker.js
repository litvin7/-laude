// Cloudflare Worker: раздаёт сайт и принимает заявки на /api/lead, пересылая их в Telegram.
// Токен бота и chat id хранятся в секретах Worker (BOT_TOKEN, CHAT_ID), а не в коде сайта.

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

async function handleLead(request, env) {
  if (request.method !== "POST") return json({ ok: false, error: "method" }, 405);
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: "bad json" }, 400); }
  const text = String(body.text || "").slice(0, 3500);
  if (!text.trim()) return json({ ok: false, error: "empty" }, 400);
  const tg = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: env.CHAT_ID, text: "🆕 Новая заявка с сайта\n\n" + text }),
  });
  const ok = tg.ok && (await tg.json()).ok;
  return json({ ok }, ok ? 200 : 502);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/lead") return handleLead(request, env);
    return env.ASSETS.fetch(request);
  },
};
