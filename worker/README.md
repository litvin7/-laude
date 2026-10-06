# Заявки в Telegram без токена на сайте

Сайт отправляет заявку на ваш Cloudflare Worker, а Worker пересылает её в Telegram-бота. Токен хранится только в секретах Cloudflare.

## Шаги (10 минут, бесплатно)

1. **Узнайте chat id.** Напишите вашему боту любое сообщение, затем откройте в браузере
   `https://api.telegram.org/bot<ТОКЕН>/getUpdates` и найдите `"chat":{"id": 123456789`. Это число и есть chat id.
2. **Создайте Worker.** Зарегистрируйтесь на https://dash.cloudflare.com, откройте Workers & Pages → Create → Create Worker, нажмите Deploy, затем Edit code.
3. Удалите код-пример, вставьте содержимое `lead-worker.js` и нажмите **Deploy**.
4. **Секреты.** В настройках Worker откройте Settings → Variables and Secrets и добавьте:
   - `BOT_TOKEN`: токен от @BotFather, тип **Secret**;
   - `CHAT_ID`: ваш chat id, тип **Secret**;
   - `ALLOWED_ORIGIN`: адрес сайта, например `https://litvin7.github.io`.
5. Скопируйте адрес Worker (вида `https://имя.ваш-ник.workers.dev`) и впишите его в `index.html` в `CONFIG.leadEndpoint`.

Готово: заявки приходят в Telegram сразу, даже когда ваш компьютер выключен.
