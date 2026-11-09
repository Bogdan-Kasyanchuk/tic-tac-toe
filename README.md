# tic-tac-toe

Хрестики-нолики на двох гравців онлайн: https://bogkas-tic-tac-toe.netlify.app

Стек: Vite 8, React 19, TypeScript 6, Tailwind CSS 4, React Router 8. Бекенд — Convex (база, серверні функції, вхід через Convex Auth). Інтерфейс — shadcn/ui на Radix, лише темна тема.

Вхід — через Google або поштою з паролем.

## Структура

- `src/` — фронт: сторінки, компоненти (`src/components/ui` — shadcn), токени дизайну в `@theme` у `src/index.css`.
- `convex/` — бекенд: ігрова логіка в `games.ts`, чисті правила гри в `rules.ts`, вхід — `auth.ts`, `emailPassword.ts`, `authRules.ts`.
- `e2e/` — тести Playwright.
- `docs/design/` — копія дизайн-канвасу й перелік токенів (`docs/design/README.md`); на `npm run dev` відкривається за адресою `/docs/design/<Ім'я>.dc.html`.

## Запуск

Потрібна Node 24.19 або новіша.

1. `npm install`
2. `npx convex dev` — логін у Convex, створює `.env.local` з `VITE_CONVEX_URL`; лишити працювати
3. `npx @convex-dev/auth` — задає в деплойменті `SITE_URL`, `JWT_PRIVATE_KEY` і `JWKS`
4. Google OAuth: створити клієнт і задати `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` через `npx convex env set` — див. https://labs.convex.dev/auth/config/oauth/google
5. `npm run dev` і відкрити http://localhost:5173

Dev-сервер слухає й локальну мережу (Network-адресу Vite друкує при старті), тож гру можна відкрити з телефона; вхід через Google повертає на ту саму адресу.

## Скрипти

- `npm run dev` / `npm run dev:convex` — фронт / бекенд у режимі розробки
- `npm run test` (у режимі спостереження) / `npm run test:once` — Vitest: функції Convex через convex-test і фронтові тести в jsdom
- `npm run test:e2e` — Playwright (десктоп 1280px і телефон 390px) проти `npm run dev`; потрібен запущений `npx convex dev`. Тестові користувачі `@e2e.test` прибираються самі після прогону (вручну — `npx convex run testing:deleteE2eUsers`). Проти іншої адреси — `E2E_BASE_URL=…`, проти prod-деплойменту ще й `E2E_PROD=1`
- `npm run lint`, `npm run lint:fix`, `npm run typecheck`, `npm run build`

## Деплой

Netlify підключений до GitHub: кожен пуш у `main` запускає `npx convex deploy --cmd 'npm run build'` (див. `netlify.toml`) — оновлює функції Convex на prod і збирає фронт. У Netlify потрібна лише змінна `CONVEX_DEPLOY_KEY` (контекст Production).
