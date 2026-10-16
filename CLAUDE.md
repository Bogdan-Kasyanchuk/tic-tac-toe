# tic-tac-toe

Хрестики-нолики на двох гравців онлайн: https://bogkas-tic-tac-toe.netlify.app

## Стек і структура

- Фронт: Vite 8, React 19, TypeScript 6, Tailwind CSS 4 (класи інлайн у JSX, токени в `@theme` у `src/index.css`), React Router 8 (декларативний режим, імпорт з `react-router`).
- UI: shadcn/ui на Radix у `src/components/ui` — це наш код: правиться як свій і за тими самими правилами форматування (після `npx shadcn add` перевір імпорт `{ cn } from '@/lib/cn'` — CLI ставить пакет `cn` — і прибери `dark:`-класи). Іконки `lucide-react`, toast-и `sonner`, форми `react-hook-form` + `zod`. Тема лише темна.
- Бекенд: Convex (`convex/`). Вся ігрова логіка — серверні мутації в `convex/games.ts`, чисті правила — `convex/rules.ts`. Вхід через Google або поштою з паролем (Convex Auth); пошта — власний провайдер `convex/emailPassword.ts` (`id: 'password'`, перевіряє зайняту пошту), правила й тексти — `convex/authRules.ts`. Все, що має побачити людина, сервер кидає як `ConvexError` (звичайні `Error` на prod приховані). Гравець визначається за `userId`.
- Клієнт тільки підписується на `games.get` і викликає мутації; нічого не валідує всерйоз.

## Команди

- `npx convex dev` — бекенд у режимі розробки (dev-деплоймент `compassionate-cobra-24`); `npm run dev` — фронт на http://localhost:5173 і в локальній мережі (`server.host` у `vite.config.ts`; Network-адресу Vite друкує при старті). Google з інших пристроїв повертає на їхню адресу, бо колбек `redirect` (`redirectUrl` у `convex/authRules.ts`) у dev, де `SITE_URL` — localhost, пускає приватні IPv4; на prod — лише `SITE_URL`.
- `npm run test:once` — Vitest: функції Convex через `convex-test` (edge-runtime) і фронт (jsdom).
- `npm run test:e2e` — Playwright (проєкти `desktop` 1280px і `phone` 390px) проти `npm run dev` і dev-деплойменту; `npx convex dev` має бути запущений. Тестові користувачі — лише `@e2e.test`, прибирання — `npx convex run testing:deleteE2eUsers` (teardown робить це сам).
- `npm run lint`, `npm run lint:fix`, `npm run typecheck` (три tsconfig: `src`, конфіги Vite/Vitest/Playwright з `e2e/`, `convex`), `npm run build`.

## Конвенції

- Стиль коду — ESLint + `@stylistic` (як у `jackpot-sounds`): 4 пробіли, `[ a ]`, `${ a }`, атрибути JSX у подвійних лапках. Prettier не використовується, бо схлопує `cn([…])`. Після правок — `npm run lint:fix`.
- Класи Tailwind і стрілки — за скілом `tailwind-format` (`.claude/skills/tailwind-format/`, там і сканери для ревізії).
- Дизайн — канвас https://claude.ai/artifact/PDTUiw8QMxFx1aLJRnp4US, копія в `docs/design/` (відкривається на `npm run dev` за адресою `/docs/design/<Ім'я>.dc.html`). Кольори лише через токени в `src/index.css`, не hex у класах.
- Нова поведінка — з тестом, що спершу падає.

## Деплой і секрети

- Netlify підключений до GitHub: кожен пуш у `main` запускає `npx convex deploy --cmd 'npm run build'` (`netlify.toml`) — оновлює функції Convex на prod (`fantastic-wildcat-279`) і фронт. У Netlify потрібен лише `CONVEX_DEPLOY_KEY` (контекст Production).
- Google OAuth — один клієнт для dev і prod. Змінив Client secret у Google — онови `AUTH_GOOGLE_SECRET` і в dev (`npx convex env set …`), і на prod (`… --prod`).
- Логіни в Convex, Google Cloud, Netlify і будь-які секрети робить власник; Claude у сесії лише каже, що саме зробити. Пушить на GitHub теж власник.

## Поточна робота

Підтвердження пошти й скидання пароля — розділ «Пізніше» в плані `docs/superpowers/plans/2026-10-15-redesign-email-auth.md`.

## Історія

Переписано з CRA + Firebase + SCSS у жовтні 2026; план і рішення — `docs/superpowers/plans/2026-10-12-vite-convex-migration.md`.

Редизайн і вхід поштою — жовтень 2026, план `docs/superpowers/plans/2026-10-15-redesign-email-auth.md`.
