# tic-tac-toe

Хрестики-нолики на двох гравців онлайн: https://bogkas-tic-tac-toe.netlify.app

## Стек і структура

- Фронт: Vite 8, React 19, TypeScript 6, Tailwind CSS 4 (класи інлайн у JSX, токени в `@theme` у `src/index.css`), React Router 8 (декларативний режим, імпорт з `react-router`).
- Бекенд: Convex (`convex/`). Вся ігрова логіка — серверні мутації в `convex/games.ts`, чисті правила — `convex/rules.ts`. Вхід через Google (Convex Auth). Гравець визначається за `userId`.
- Клієнт тільки підписується на `games.get` і викликає мутації; нічого не валідує всерйоз.

## Команди

- `npx convex dev` — бекенд у режимі розробки (dev-деплоймент `compassionate-cobra-24`); `npm run dev` — фронт на http://localhost:5173.
- `npm run test:once` — Vitest: функції Convex через `convex-test` (edge-runtime) і фронт (jsdom).
- `npm run lint`, `npm run lint:fix`, `npm run typecheck` (три tsconfig: `src`, конфіги Vite/Vitest, `convex`), `npm run build`.

## Конвенції

- Стиль коду — ESLint + `@stylistic` (як у `jackpot-sounds`): 4 пробіли, `[ a ]`, `${ a }`, атрибути JSX у подвійних лапках. Prettier не використовується, бо схлопує `cn([…])`. Після правок — `npm run lint:fix`.
- Класи Tailwind і стрілки — за скілом `tailwind-format` (`.claude/skills/tailwind-format/`, там і сканери для ревізії).
- Нова поведінка — з тестом, що спершу падає.

## Деплой і секрети

- Netlify підключений до GitHub: кожен пуш у `main` запускає `npx convex deploy --cmd 'npm run build'` (`netlify.toml`) — оновлює функції Convex на prod (`fantastic-wildcat-279`) і фронт. У Netlify потрібен лише `CONVEX_DEPLOY_KEY` (контекст Production).
- Google OAuth — один клієнт для dev і prod. Змінив Client secret у Google — онови `AUTH_GOOGLE_SECRET` і в dev (`npx convex env set …`), і на prod (`… --prod`).
- Логіни в Convex, Google Cloud, Netlify і будь-які секрети робить власник; Claude у сесії лише каже, що саме зробити. Пушить на GitHub теж власник.

## Поточна робота

Редизайн (shadcn/ui, темна тема) і вхід поштою з паролем (поки без підтвердження пошти й скидання пароля) — план `docs/superpowers/plans/2026-10-15-redesign-email-auth.md`, виконання Native. Дизайн — канвас https://claude.ai/artifact/PDTUiw8QMxFx1aLJRnp4US, копія в `docs/design/`. Продовжувати з першого кроку без галочки.

## Історія

Переписано з CRA + Firebase + SCSS у жовтні 2026; план і рішення — `docs/superpowers/plans/2026-10-12-vite-convex-migration.md`.
