# Сайт + заявки на Cloudflare

Один Cloudflare Worker и раздаёт сайт (папка `public/`), и принимает заявки по адресу `/api/lead`, пересылая их в Telegram.
Токен бота хранится только в секретах Cloudflare. Репозиторий можно сделать **приватным**: посетители видят только сайт.

## Настройка

1. В Cloudflare откройте Workers & Pages → Create → **Import a repository** и выберите этот репозиторий. Настройки сборки оставьте по умолчанию (Deploy command: `npx wrangler deploy`).
2. После первого деплоя откройте Worker → **Settings → Variables and Secrets** и добавьте два значения с типом **Secret**:
   - `BOT_TOKEN`: токен бота от @BotFather;
   - `CHAT_ID`: ваш chat id (узнать у @userinfobot).
3. Сайт откроется по адресу `https://peepandpeak.<ваш-ник>.workers.dev`.
4. Свой домен: Worker → **Settings → Domains & Routes → Add → Custom domain**. Домен должен быть добавлен в Cloudflare (купить можно прямо там: Domain Registration).

Каждый пуш в репозиторий автоматически обновляет сайт.
