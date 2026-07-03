# ЧМ-2026 Прогнозы

Сайт прогнозов на матчи Чемпионата мира по футболу 2026. Next.js (App Router) + PostgreSQL
(Prisma) + Auth.js (Google и email/пароль). Расписание и результаты подтягиваются из
[football-data.org](https://www.football-data.org/).

Правила начисления очков (см. [src/lib/scoring.ts](src/lib/scoring.ts)):
победитель — 3, ничья — 1, точный счёт — 5. Очки начисляются только за тип ставки, который
выбрал пользователь (например, ставка «точный счёт» без точного попадания — 0 очков, даже
если победитель угадан).

## Локальный запуск

```bash
nvm use --lts        # или просто убедитесь что установлен Node 20+
npm install
```

### 1\. Локальная база данных

Для разработки проще всего поднять локальный Postgres через встроенный Prisma dev-сервер
(не требует Docker):

```bash
npx prisma dev -d --name worldcup   # выводит DATABASE\_URL — вставьте его в .env
npm run db:push                     # применяет schema.prisma к базе
npm run db:seed                     # (опционально) добавляет пару тестовых матчей
```

Сервер `prisma dev` работает в фоне, пока вы явно не остановите его (`npx prisma dev stop`) —
это удобно для разработки, но это не постоянное хранилище: он живёт, пока запущен процесс на
вашей машине. Для продакшена используется отдельная облачная база (см. ниже).

### 2\. Переменные окружения

Скопируйте `.env.example`-значения (они уже частично проставлены в `.env`) и заполните:

|Переменная|Где взять|
|-|-|
|`DATABASE\_URL`|из `prisma dev` (локально) или из Neon/Vercel Postgres (продакшн)|
|`AUTH\_SECRET`|`npx auth secret` или `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`|
|`AUTH\_GOOGLE\_ID` / `AUTH\_GOOGLE\_SECRET`|Google Cloud Console, см. инструкцию ниже|
|`FOOTBALL\_DATA\_API\_KEY`|football-data.org, см. инструкцию ниже|
|`CRON\_SECRET`|любая случайная строка — защищает эндпоинт синхронизации матчей|
|`ADMIN\_EMAILS`|через запятую — эти email автоматически получают роль admin при следующем входе|

```bash
npm run dev
```

Откройте http://localhost:3000.

## Настройка внешних сервисов

### football-data.org (расписание и результаты)

1. Зарегистрируйтесь на https://www.football-data.org/client/register — бесплатно.
2. После подтверждения email в личном кабинете будет ваш API-ключ (`X-Auth-Token`).
3. Вставьте его в `FOOTBALL\_DATA\_API\_KEY`.
4. Бесплатный тариф включает турнир FIFA World Cup, лимит 10 запросов/минуту — этого более
чем достаточно, потому что мы синхронизируем расписание раз в 15 минут по крону, а не при
каждом запросе пользователя.

Проверить синхронизацию вручную (сервер должен быть запущен):

```bash
curl -H "Authorization: Bearer $CRON\_SECRET" http://localhost:3000/api/cron/sync-matches
```

### Google OAuth (вход через Google)

1. Откройте https://console.cloud.google.com/ и создайте новый проект (или выберите
существующий) в верхнем селекторе проектов.
2. В меню слева: **APIs \& Services → OAuth consent screen**. Выберите тип **External**,
заполните название приложения и свой email как контактный. На шаге Scopes ничего
добавлять не нужно, на шаге Test users можно добавить свой email, пока приложение не
опубликовано.
3. **APIs \& Services → Credentials → Create Credentials → OAuth client ID**.

   * Application type: **Web application**.
   * Authorized JavaScript origins: `http://localhost:3000` (и позже ваш прод-домен,
например `https://your-app.vercel.app`).
   * Authorized redirect URIs:
`http://localhost:3000/api/auth/callback/google`
(и позже `https://your-app.vercel.app/api/auth/callback/google`).
4. После создания Google покажет **Client ID** и **Client secret** — вставьте их в
`AUTH\_GOOGLE\_ID` и `AUTH\_GOOGLE\_SECRET` в `.env` (никогда не в README или другой файл,
который попадёт в git).
5. Пока приложение в статусе "Testing", войти смогут только email-адреса, добавленные в
Test users на шаге 2. Чтобы открыть вход всем, на OAuth consent screen нажмите
**Publish app** (для базовых scope верификация Google обычно не требуется).

### Администраторы

Добавьте email через запятую в `ADMIN_EMAILS` — при следующем входе (Google или email/пароль)
аккаунт с таким email автоматически получит роль `ADMIN` и доступ к `/admin/users`. Админ может
редактировать имя/аватар любого пользователя, менять роль и блокировать/разблокировать аккаунты
(кроме своего собственного — это защита от случайной самоблокировки). Заблокированные
пользователи не могут войти и не могут делать ставки.

## Продакшн (деплой в облако)

Рекомендуемый путь — Vercel + Neon Postgres (создаётся прямо из панели Vercel).

1. Запушьте репозиторий на GitHub и импортируйте его в https://vercel.com/new.
2. В настройках проекта Vercel: **Storage → Create Database → Postgres (Neon)** — Vercel сам
создаст базу и подставит `DATABASE\_URL`/`DATABASE\_URL\_UNPOOLED` в переменные окружения
проекта.
3. Добавьте остальные переменные окружения проекта в Vercel (**Settings → Environment
Variables**): `AUTH\_SECRET` (сгенерируйте новый, отдельный от локального),
`AUTH\_GOOGLE\_ID`, `AUTH\_GOOGLE\_SECRET`, `FOOTBALL\_DATA\_API\_KEY`, `CRON\_SECRET`, `ADMIN\_EMAILS`.
4. Добавьте в Google Cloud Console (см. выше) продакшн-домен в Authorized origins и
`.../api/auth/callback/google` в Authorized redirect URIs.
5. Настройте Build Command в Vercel на `prisma migrate deploy \&\& next build`, чтобы схема
применялась к продакшн-базе при каждом деплое.
6. Задеплойте. `vercel.json` уже содержит Vercel Cron, который будет дёргать
`/api/cron/sync-matches` — Vercel сам добавляет заголовок
`Authorization: Bearer $CRON\_SECRET`, если переменная `CRON\_SECRET` задана в проекте.
   На бесплатном (Hobby) тарифе Vercel крон может запускаться не чаще раза в день, поэтому
   расписание сейчас `0 6 * * *` (раз в сутки). Если перейдёте на Pro — можно поставить, например,
   `*/15 * * * *` (раз в 15 минут) для более свежих результатов.

## Структура проекта

* `prisma/schema.prisma` — модели `User`/`Account`/`Session` (Auth.js) и `Match`/`Prediction`.
* `src/auth.ts` — конфигурация Auth.js (Google + email/пароль).
* `src/lib/football-data.ts` — клиент football-data.org.
* `src/lib/scoring.ts` — начисление очков за завершённые матчи.
* `src/app/api/cron/sync-matches` — эндпоинт синхронизации расписания/результатов.
* `src/app/matches`, `src/app/matches/\[id]` — расписание/результаты и форма ставки.
* `src/app/standings` — турнирная таблица: текущий этап, группы с очками команд, сетка плей-офф.
* `src/app/leaderboard` — общий рейтинг игроков.
* `src/app/profile` — редактирование своего имени и аватара (30 пресетов, `src/lib/avatars.ts`).
* `src/app/admin/users` — модерация: список игроков, блокировка, редактирование любого профиля.

