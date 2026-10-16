# tic-tac-toe

Хрестики-нолики на двох гравців онлайн.

Стек: Vite + React 19 + TypeScript + Tailwind CSS 4 + React Router 8. Бекенд — Convex (база, серверні функції, вхід через Convex Auth). Інтерфейс — shadcn/ui, темна тема.

Вхід — через Google або поштою з паролем (без підтвердження пошти й скидання пароля).

## Запуск

1. `npm install`
2. `npx convex dev` — логін у Convex, створює `.env.local` з `VITE_CONVEX_URL`; лишити працювати
3. Google OAuth і змінні `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — див. https://labs.convex.dev/auth/config/oauth/google
4. `npm run dev` і відкрити http://localhost:5173

## Скрипти

- `npm run dev` / `npm run dev:convex` — фронт / бекенд у режимі розробки
- `npm run test` — Vitest (функції Convex через convex-test + фронтові тести в jsdom)
- `npm run test:e2e` — Playwright (десктоп і телефон) проти `npm run dev`; потрібен запущений `npx convex dev`. Тестові користувачі `@e2e.test` прибираються самі після прогону
- `npm run lint`, `npm run lint:fix`, `npm run typecheck`, `npm run build`

Деплой — Netlify, команда збірки `npx convex deploy --cmd 'npm run build'` (див. `netlify.toml`).
