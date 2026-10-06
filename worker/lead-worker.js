// Cloudflare Worker: принимает заявку с сайта и пересылает её в Telegram.
// Токен бота и chat id хранятся в секретах Worker (BOT_TOKEN, CHAT_ID), а не в коде сайта.
// ALLOWED_ORIGIN — адрес сайта, например https://litvin7.github.io (можно перечислить через запятую).

export default {
  async fetch(request, env) {
    const origins = (env.ALLOWED_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean);
    const origin = request.headers.get("Origin") || "";
    const allow = origins.length === 0 || origins.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": allow ? origin || "*" : "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST" || !allow) return new Response("Forbidden", { status: 403, headers: cors });

    let body;
    try { body = await request.json(); } catch { return new Response("Bad JSON", { status: 400, headers: cors }); }
    const text = String(body.text || "").slice(0, 3500);
    if (!text.trim()) return new Response("Empty", { status: 400, headers: cors });

    const tg = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.CHAT_ID, text: "🆕 Новая заявка с сайта\n\n" + text }),
    });
    const ok = tg.ok && (await tg.json()).ok;
    return new Response(JSON.stringify({ ok }), { status: ok ? 200 : 502, headers: { ...cors, "Content-Type": "application/json" } });
  },
};
