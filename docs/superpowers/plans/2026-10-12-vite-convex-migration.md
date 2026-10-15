# Міграція tic-tac-toe на Vite + Convex — план реалізації

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** переписати гру з CRA + Firebase + SCSS на Vite + React 19 + Tailwind 4 (класи інлайн у JSX) + Convex так, щоб вигляд лишився 1:1, а вся ігрова логіка виконувалась на сервері.

**Architecture:** SPA на Vite з React Router 8 у декларативному режимі. Бекенд — Convex: таблиця `games`, мутації `enter` / `makeMove` / `clearBoard` / `newSession` / `leave` і внутрішня `finishRound` через планувальник. Ідентичність гравця — `userId` з Convex Auth (Google OAuth). Клієнт тільки підписується на `games.get` і викликає мутації. Чисті правила гри лежать у `convex/rules.ts` і покриті тестами.

**Tech Stack:** Vite 8, React 19.2+, TypeScript 6.0, React Router 8, Tailwind CSS 4.3 (`@tailwindcss/vite`), Convex 1.46+, `@convex-dev/auth` + `@auth/core` 0.41, `motion`, `react-hot-toast`, `react-loader-spinner` 8, `nanoid`, `clsx` + `tailwind-merge`, Vitest 5 + `convex-test`, ESLint 9 + `@stylistic`, husky + lint-staged, Netlify.

**Spec:** окремого документа немає. Специфікація — це рішення з розмови, зведені в розділ «Рішення» нижче.

## Рішення

- Стек: Vite + React 19 + TS + Tailwind 4 + React Router + Convex з Convex Auth (Google). Дизайн не змінюється, SCSS переноситься в інлайн-класи Tailwind.
- Помилки, що виправляються міграцією:
  1. ID гри береться з URL `/game/:gameId`, а не з `location.state`, тож посилання на гру працює.
  2. Нічия обробляється: напис «Draw» і автоскидання поля, як після перемоги.
  3. Помилки справді показуються toast-ом (замість зламаного `tryCatch`).
  4. Гравці розрізняються за `userId`, а не за `displayName`.
  5. Підключення до гри — одна транзакційна мутація, без race condition.
  6. Хід, черга, лічильник і скидання поля перевіряються на сервері. Скидання після раунду робить `ctx.scheduler.runAfter(1500, …)`.
  7. Одна підписка на гру замість дев'яти; `useEscapeKey` без перепідписки на кожен рендер; вихід одного гравця не видаляє гру з-під іншого.
- Єдині видимі відмінності від старої версії:
  - напис «Draw» у блоці статистики;
  - toast-и на нові помилки валідації («Generate Game ID first», «Enter the game ID», «Invalid game ID»);
  - вхід через Google іде редиректом, а не попапом (так працює Convex Auth);
  - оверлей «Waiting the second player» бачить будь-хто, хто сидить у грі сам, а не тільки творець.

## Global Constraints

- Node `>=22.12` (вимога Vite 8).
- TypeScript `~6.0.3`, **не 7.x**: `typescript-eslint@8.71` має peer `typescript <6.1.0`.
- ESLint `^9`, **не 10**: `eslint-plugin-import@2.32` не підтримує ESLint 10, а конфіг береться з `jackpot-sounds`, де стоїть ESLint 9.
- `@auth/core@^0.41.3`: документація Convex Auth вказує 0.41.1, але в ній критичні вразливості (GHSA-x445-f3h2-j279 та ін.); 0.41.3 їх виправляє і задовольняє peer `^0.41.1`.
- React `^19.2.7`: peer `react-router@8`, плюс потрібен стабільний `useEffectEvent`.
- Роутер імпортується з `react-router` (не `react-router-dom`), декларативний режим `BrowserRouter` / `Routes` / `Route`.
- Tailwind 4 без `tailwind.config.js` і без SCSS. Токени живуть у `@theme` в `src/index.css`.
- **Вигляд 1:1.** Кольори, розміри, відступи, брейкпоінти й анімації (150 мс для появи знаків, 75 мс для зміни напису в статистиці) збігаються зі старими SCSS. Таблиця відповідностей класів наведена в кожній UI-задачі.
- **Формат класів** (з `~/.claude/CLAUDE.md`, скіл `tailwind-format`):
  - якщо всі класи з однієї брейкпоінт-групи, це плаский рядок;
  - якщо груп більше однієї, це `cn([…])`, один рядок на групу, порядок база → `max-*` → `sm` → `md` → `lg` → `xl`;
  - `hover:`, `before:`, `after:`, `placeholder:`, `focus:`, `group-*` лишаються в базовому рядку.
- **Стрілка, яка нічого не повертає, має блокове тіло**: у JSX-пропсах, колбеках хуків і cleanup-ах `useEffect`.
- Довільні значення в дужках (`w-[calc(100%+6px)]`) — тільки там, де шкали Tailwind 4 немає. Крок шкали 4px покриває всі старі кастомні spacing-и (`5.5`, `12.5`, `17.5`, `18.5`, `105`, `125`, `175`, `480`…), тож вони пишуться без дужок.
- **Стиль коду — як у `~/Documents/Projects/jackpot-sounds`**: ESLint + `@stylistic`, 4 пробіли, `[ a ]`, `${ a }`, атрибути JSX у подвійних лапках, `{ value }` у JSX, без висячих ком. Prettier прибирається, бо він схлопує `cn([…])` в один рядок. Код у плані наближений до цього стилю; остаточний вигляд дає `npm run lint:fix`, який треба запускати після кожного створеного файлу.
- Тексти UI англійською, як зараз.
- Кожен коміт закінчується рядком `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Кроки з позначкою 👤 виконує власник проєкту: логіни в Convex, Google Cloud і Netlify, а також секрети.

## Review Focus

Нижче — сценарії, які легко зламати і які не видно з однієї задачі. Для кожного вказано, де саме він перевіряється.

1. **Той самий акаунт у двох вкладках.** Друга вкладка отримує `'already'`, другий слот лишається вільним, і грати самому з собою не можна. Тест — у задачі 4.
2. **Clear у вікні 1.5 с після перемоги.** Запланований `finishRound` не повинен стерти хід нового раунду. Тест — у задачі 6.
3. **Суперник виходить посеред раунду.** Той, хто лишився, бачить «Waiting the second player» з обнуленими рахунками, а ходи того, хто вийшов, сервер відхиляє. Тести — у задачі 6.
4. **Пряме посилання `/game/:id` без логіну.** Після входу через Google користувач повертається в ту саму гру й займає вільний слот. Ручна перевірка — у задачі 9, крок QA.
5. **Подвійний клік по клітинці.** Має бути рівно один хід і жодного toast-а «Not your turn». Серверна частина вже покрита тестом «хід не в свою чергу» в задачі 5; клієнтська (ref `isMoving`) перевіряється вручну в задачі 9, крок QA.

---

## Структура файлів після міграції

```
tic-tac-toe/
├─ .claude/skills/tailwind-format/   копія з jackpot-sounds (сканери класів)
├─ convex/
│  ├─ _generated/                    генерує `convex dev`, комітиться
│  ├─ auth.config.ts  auth.ts  http.ts   Convex Auth (генерує `npx @convex-dev/auth`)
│  ├─ schema.ts                      authTables + games
│  ├─ validators.ts                  валідатори полів гри
│  ├─ rules.ts / rules.test.ts       чисті правила: лінії, нічия, константи
│  ├─ users.ts / users.test.ts       users.me
│  ├─ games.ts / games.test.ts       ігрові query/mutation
│  ├─ test.setup.ts                  modules + хелпери convex-test
│  └─ tsconfig.json                  генерує `convex dev`
├─ public/                           іконки й маніфест без змін (без index.html)
├─ src/
│  ├─ main.tsx  App.tsx  index.css  vite-env.d.ts
│  ├─ assets/            bg.jpg, not-avatar.jpg (без змін)
│  ├─ lib/               cn.ts, errorMessage.ts, motion.ts
│  ├─ hooks/             useEscapeKey.ts
│  ├─ types/             game.ts
│  ├─ routes/            PrivateRoute/, PublicRoute/
│  ├─ pages/             HomePage/, LoginPage/, GamePage/
│  └─ components/        Button, Cell (+ winLine.ts, winLine.test.ts), Container, Fade, FadeSwitch,
│                        MarkIcon, Modal, NavBar, Overlay, Player, RadioInput, Spinner, Statistics,
│                        UserMenu, Waiting
├─ index.html  vite.config.ts  vitest.config.ts  tsconfig.json  eslint.config.mjs
└─ netlify.toml  package.json  README.md
```

Компоненти лишаються в старому патерні `components/X/X.tsx` + `index.ts` з `export { default } from './X';`. Обгортки `components/Home`, `components/Login` і `components/Game` зникають: їхній вміст переходить прямо в `pages/*`. Теки `interfaces/` і `types/T*.ts` теж зникають: пропси типізуються поруч із компонентом, а ігрові типи виводяться з API Convex (`src/types/game.ts`).

---

### Task 1: Репозиторій і тулінг (Vite 8, TS 6, Tailwind 4, ESLint)

**Files:**
- Move: `src/` → `legacy/` (довідка до задачі 10), `legacy/assets/` → `src/assets/`, `public/index.html` → `index.html`
- Delete: `tailwind.config.js`, `postcss.config.cjs`, `.eslintrc.json`, `.prettierrc.yaml`, `package-lock.json`
- Create: `package.json` (перезапис), `vite.config.ts`, `tsconfig.json` (перезапис), `eslint.config.mjs`, `src/index.css`, `src/lib/cn.ts`, `src/vite-env.d.ts`, `src/main.tsx` (тимчасовий), `.claude/skills/tailwind-format/`
- Modify: `.gitignore`, `.husky/pre-commit`, `index.html`

**Interfaces:**
- Produces: аліаси `@/*` → `src/*` і `@convex/*` → `convex/*`; `cn(...inputs: ClassValue[]): string` (default export із `@/lib/cn`); токени теми (`blue-50`, `blue-200`, `blue-700`, `blue-dark`, `stone-300`, `red`, `green`, `white`, `black`, брейкпоінти `xs`/`md`/`lg`/`xl`); скрипти `dev`, `build`, `typecheck`, `lint`, `lint:fix`.

- [x] **Step 1: Клон і гілка**

```bash
cd ~/Documents/Projects
git clone https://github.com/Bogdan-Kasyanchuk/tic-tac-toe.git
cd tic-tac-toe
git switch -c migrate/vite-convex
mkdir -p docs/superpowers/plans
```

Скопіюй цей план у `docs/superpowers/plans/2026-10-12-vite-convex-migration.md` репозиторію.

- [x] **Step 2: Прибрати CRA, зберегти старий код як довідку**

```bash
git mv src legacy
mkdir src
git mv legacy/assets src/assets
git mv public/index.html index.html
git rm tailwind.config.js postcss.config.cjs .eslintrc.json .prettierrc.yaml package-lock.json
rm -rf node_modules
mkdir -p .claude/skills
cp -R ~/Documents/Projects/jackpot-sounds/.claude/skills/tailwind-format .claude/skills/
```

- [x] **Step 3: Новий `package.json`**

```json
{
    "name": "tic-tac-toe",
    "version": "1.0.0",
    "private": true,
    "type": "module",
    "engines": {
        "node": ">=22.12"
    },
    "scripts": {
        "dev": "vite",
        "build": "npm run typecheck && vite build",
        "preview": "vite preview",
        "typecheck": "tsc -p .",
        "lint": "eslint .",
        "lint:fix": "eslint . --fix",
        "prepare": "husky"
    },
    "lint-staged": {
        "*.{ts,tsx,mjs}": "eslint --fix"
    }
}
```

```bash
npm install react@^19.2.7 react-dom@^19.2.7 react-router@^8.4.0 react-hot-toast@^2.6.1 react-loader-spinner@^8.0.2 motion@^14.1.0 nanoid@^6.0.2 clsx@^2.1.1 tailwind-merge@^3.7.0
npm install -D vite@^8.3.4 @vitejs/plugin-react@^6.1.2 tailwindcss@^4.3.3 @tailwindcss/vite@^4.3.3 typescript@~6.0.3 @types/react@^19.3.0 @types/react-dom@^19 @types/node@^24 eslint@^9 @eslint/js@^9 typescript-eslint@^8.71.1 eslint-plugin-react-hooks@^7.1.1 eslint-plugin-react-refresh@^0.5.7 @stylistic/eslint-plugin@^5.10.0 eslint-plugin-import@^2.32.0 eslint-plugin-perfectionist@^5.12.1 globals@^17 husky@^9.1.7 lint-staged@^17.6.0
```

- [x] **Step 4: `vite.config.ts` і `tsconfig.json`**

```ts
// vite.config.ts
import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [ react(), tailwindcss() ],
    resolve: {
        alias: {
            '@': path.resolve(import.meta.dirname, 'src'),
            '@convex': path.resolve(import.meta.dirname, 'convex')
        }
    }
});
```

```json
{
    "compilerOptions": {
        "target": "ES2022",
        "lib": [ "ES2023", "DOM", "DOM.Iterable" ],
        "module": "ESNext",
        "moduleResolution": "Bundler",
        "jsx": "react-jsx",
        "strict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noFallthroughCasesInSwitch": true,
        "verbatimModuleSyntax": true,
        "isolatedModules": true,
        "skipLibCheck": true,
        "noEmit": true,
        "allowImportingTsExtensions": true,
        "types": [ "vite/client", "node" ],
        "paths": {
            "@/*": [ "./src/*" ],
            "@convex/*": [ "./convex/*" ]
        }
    },
    "include": [ "src", "vite.config.ts", "vitest.config.ts" ]
}
```

`baseUrl` не потрібен (у TS 6 він deprecated). `paths` працює відносно `tsconfig.json`.

- [x] **Step 5: `eslint.config.mjs`**

Перший блок адаптований із `jackpot-sounds`: прибрано Next, TanStack Query, next-intl і `@eslint-react`. Другий блок (`@stylistic` + `perfectionist`) **копіюється дослівно** з `~/Documents/Projects/jackpot-sounds/eslint.config.mjs`: це об'єкт `{ plugins: { '@stylistic': stylistic, perfectionist }, rules: { … } }` від `'@stylistic/brace-style'` до `'perfectionist/sort-jsx-props'` включно.

```js
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import perfectionist from 'eslint-plugin-perfectionist';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tsEslint from 'typescript-eslint';

export default defineConfig([
    globalIgnores([ 'dist/**', 'legacy/**', 'convex/_generated/**', '.claude/**' ]),
    js.configs.recommended,
    tsEslint.configs.recommended,
    reactHooks.configs.flat.recommended,
    reactRefresh.configs.vite(),
    {
        files: [ '**/*.{ts,tsx}' ],
        plugins: {
            import: importPlugin
        },
        languageOptions: {
            globals: {
                ...globals.browser
            },
            parser: tsEslint.parser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname
            }
        },
        rules: {
            'no-console': [ 'error' ],
            'no-alert': [ 'error' ],
            'no-debugger': [ 'error' ],
            'curly': [ 'error' ],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    varsIgnorePattern: '^_'
                }
            ],
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'typeParameter',
                    prefix: [ 'T' ],
                    format: [ 'PascalCase' ]
                }
            ],
            'sort-imports': [ 'error', { ignoreDeclarationSort: true } ],
            'import/no-unresolved': 'off',
            'import/newline-after-import': [ 'error', { count: 1 } ],
            'import/order': [
                'error',
                {
                    'alphabetize': {
                        order: 'asc',
                        caseInsensitive: true
                    },
                    'newlines-between': 'always',
                    'groups': [
                        [ 'builtin', 'external' ],
                        'internal',
                        'parent',
                        [ 'sibling', 'index' ]
                    ],
                    'pathGroups': [
                        { pattern: '@/**', group: 'internal' },
                        { pattern: '@convex/**', group: 'internal' }
                    ],
                    'pathGroupsExcludedImportTypes': [ 'builtin' ]
                }
            ]
        }
    }
    // ← сюди дослівно блок `@stylistic` + `perfectionist` з jackpot-sounds
]);
```

- [x] **Step 6: Тема Tailwind і хелпер `cn`**

Значення перенесені 1:1 з `tailwind.config.js` і `legacy/styles/components/_base.scss`.

```css
/* src/index.css */
@import 'tailwindcss';

/* Tailwind 4 за замовчуванням вмикає hover лише на пристроях із курсором; у старій версії hover був скрізь */
@custom-variant hover (&:hover);

@theme {
    --breakpoint-*: initial;
    --breakpoint-xs: 22.5rem;
    --breakpoint-md: 48rem;
    --breakpoint-lg: 64rem;
    --breakpoint-xl: 90rem;

    --color-*: initial;
    --color-white: #fff;
    --color-black: #000;
    --color-red: #ff0000;
    --color-green: #008000;
    --color-blue-50: #eff6ff;
    --color-blue-200: #bfdbfe;
    --color-blue-700: #1d4ed8;
    --color-blue-dark: #1b1c3a;
    --color-stone-300: #d6d3d1;

    --font-sans: 'Open Sans', sans-serif;
}

@layer base {
    /* Tailwind 4 прибрав cursor: pointer у кнопок, у Tailwind 3 він був */
    button:not(:disabled),
    [role='button']:not(:disabled) {
        cursor: pointer;
    }

    body {
        @apply text-base leading-none font-normal text-black;
        -webkit-text-size-adjust: 100%;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
    }
}
```

```ts
// src/lib/cn.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```

```ts
// src/vite-env.d.ts
interface ImportMetaEnv {
    readonly VITE_CONVEX_URL: string
}
```

- [x] **Step 7: `index.html` і тимчасовий `main.tsx`**

В `index.html` прибрати всі `%PUBLIC_URL%` (шляхи на кшталт `/favicon.ico` лишаються абсолютними), замінити `description` на `Online tic-tac-toe for two players` і перед `</body>` додати `<script type="module" src="/src/main.tsx"></script>`. Блоки `<div id="root">` і `<div id="root-modal">` лишаються.

```tsx
// src/main.tsx (тимчасовий, задача 7 перепише)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@/index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <p className="p-5 text-2xl font-semibold uppercase">Tic-Tac-Toe</p>
    </StrictMode>
);
```

- [x] **Step 8: `.gitignore` і husky**

Додати в `.gitignore` рядки `dist`, `*.local`, `.env.local`. Перезаписати `.husky/pre-commit`:

```sh
npx lint-staged
```

- [x] **Step 9: Перевірка**

```bash
npm run lint:fix && npm run lint && npm run typecheck && npm run build
npm run dev
```

Очікується: lint, typecheck і build проходять без помилок. На `http://localhost:5173` видно напис «TIC-TAC-TOE» шрифтом Open Sans.

- [x] **Step 10: Коміт**

```bash
git add -A
git commit -m "chore: replace CRA with Vite 8, TS 6, Tailwind 4 and flat ESLint"
```

---

### Task 2: Convex + Convex Auth (Google) + `users.me`

**Files:**
- Create: `convex/schema.ts`, `convex/users.ts`, `convex/test.setup.ts`, `convex/users.test.ts`, `vitest.config.ts`
- Create (генератор): `convex/auth.ts`, `convex/auth.config.ts`, `convex/http.ts`, `convex/tsconfig.json`, `convex/_generated/*`, `.env.local`
- Modify: `package.json` (скрипти)

**Interfaces:**
- Produces:
  - `api.users.me`: query без аргументів, повертає `{ name: string, avatar: string } | null`.
  - `setup(): TestConvex<typeof schema>` і `asUser(t, name): Promise<{ userId: Id<'users'>, client: TestConvexForDataModel }>` з `convex/test.setup.ts`.
  - Скрипти `dev:convex`, `test`, `test:once`; `typecheck` тепер перевіряє і `convex/`.

- [x] **Step 1: Залежності й скрипти**

```bash
npm install convex@^1.46.0 @convex-dev/auth@^0.0.96 @auth/core@^0.41.3
npm install -D convex-test@^0.0.61 vitest@^5.0.3 @edge-runtime/vm@^5
```

У `package.json` → `scripts` додати й змінити:

```json
"dev:convex": "convex dev",
"typecheck": "tsc -p . && tsc -p convex",
"test": "vitest",
"test:once": "vitest run"
```

- [x] **Step 2: 👤 Проєкт Convex**

```bash
npx convex dev
```

Залогінитись, створити проєкт `tic-tac-toe`. Команда створить `convex/`, `convex/_generated/` і `.env.local` з `VITE_CONVEX_URL`. Лишити її працювати в окремому терміналі: вона пушить функції й перегенеровує типи на кожне збереження.

- [x] **Step 3: 👤 Ініціалізація Convex Auth**

```bash
npx @convex-dev/auth
```

На запит `SITE_URL` відповісти `http://localhost:5173`. Команда згенерує JWT-ключі, `convex/auth.config.ts`, `convex/auth.ts`, `convex/http.ts` і поправить `convex/tsconfig.json`.

- [x] **Step 4: 👤 Google OAuth client**

У [Google Auth Platform](https://console.cloud.google.com/auth/overview) створити клієнт типу «Web application»:
- Authorized JavaScript origins: `http://localhost:5173`.
- Authorized redirect URIs: `https://<dev-deployment>.convex.site/api/auth/callback/google`. Адресу видно в дашборді Convex → Settings → URL & Deploy Key; це Deployment URL, тільки з `.site` замість `.cloud`.

```bash
npx convex env set AUTH_GOOGLE_ID <client id>
npx convex env set AUTH_GOOGLE_SECRET <client secret>
```

- [x] **Step 5: Провайдер Google**

```ts
// convex/auth.ts
import Google from '@auth/core/providers/google';
import { convexAuth } from '@convex-dev/auth/server';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [ Google ]
});
```

- [x] **Step 6: Схема, тестове оточення і падаючий тест**

```ts
// convex/schema.ts
import { authTables } from '@convex-dev/auth/server';
import { defineSchema } from 'convex/server';

export default defineSchema({
    ...authTables
});
```

```ts
// vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config.ts';

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            projects: [
                {
                    extends: true,
                    test: {
                        name: 'convex',
                        include: [ 'convex/**/*.test.ts' ],
                        environment: 'edge-runtime'
                    }
                },
                {
                    extends: true,
                    test: {
                        name: 'frontend',
                        include: [ 'src/**/*.test.{ts,tsx}' ],
                        environment: 'node'
                    }
                }
            ]
        }
    })
);
```

```ts
// convex/test.setup.ts
/// <reference types="vite/client" />
import { convexTest } from 'convex-test';

import schema from './schema';

// Vite 8 не підтримує extglob `!(…)` із документації convex-test, тому виключення — окремими шаблонами
export const modules = import.meta.glob([ './**/*.*s', '!./**/*.test.ts', '!./test.setup.ts' ]);

export const setup = () => convexTest(schema, modules);

// getAuthUserId бере userId з subject до символу «|»
export const asUser = async (t: ReturnType<typeof setup>, name: string) => {
    const userId = await t.run(async ctx => ctx.db.insert('users', {
        name,
        image: `https://example.com/${ name }.png`
    }));

    return {
        userId,
        client: t.withIdentity({ subject: `${ userId }|session-${ name }` })
    };
};
```

```ts
// convex/users.test.ts
import { expect, test } from 'vitest';

import { api } from './_generated/api';
import { asUser, setup } from './test.setup';

test('me returns null for an anonymous visitor', async () => {
    const t = setup();

    expect(await t.query(api.users.me, {})).toBeNull();
});

test('me returns the name and avatar of the signed-in user', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');

    expect(await alice.client.query(api.users.me, {})).toEqual({
        name: 'Alice',
        avatar: 'https://example.com/Alice.png'
    });
});
```

- [x] **Step 7: Тест має впасти**

Run: `npm run test:once -- --project convex`
Expected: FAIL, бо convex-test не знаходить модуль `users` (файлу `convex/users.ts` ще немає).

- [x] **Step 8: Реалізація**

```ts
// convex/users.ts
import { getAuthUserId } from '@convex-dev/auth/server';

import { query } from './_generated/server';

export const me = query({
    args: {},
    handler: async ctx => {
        const userId = await getAuthUserId(ctx);

        if (userId === null) {
            return null;
        }

        const user = await ctx.db.get('users', userId);

        if (!user) {
            return null;
        }

        return {
            name: user.name ?? '',
            avatar: user.image ?? ''
        };
    }
});
```

- [x] **Step 9: Тест проходить**

TypeScript 6 більше не підхоплює `@types/*` автоматично, тому в згенерований `convex/tsconfig.json` треба додати `"types": ["node"]`, інакше `process.env` в `auth.config.ts` не типізується.

Run: `npm run lint:fix && npm run test:once -- --project convex && npm run typecheck`
Expected: PASS, 2 тести. `npx convex dev` у сусідньому терміналі показує «Convex functions ready».

- [x] **Step 10: Коміт**

```bash
git add -A
git commit -m "feat: add Convex backend with Google auth and users.me"
```

---

### Task 3: Чисті правила гри (`convex/rules.ts`)

**Files:**
- Create: `convex/rules.ts`, `convex/rules.test.ts`

**Interfaces:**
- Produces (усе з `convex/rules.ts`):
  - типи `Mark = 'circle' | 'cross'`, `Cell = Mark | ''`, `Line = 'horizontal' | 'vertical' | 'rotate_45' | 'rotate_-45'`, `WinLine = { line: Line, cells: number[] }`;
  - константи `BOARD_SIZE = 9`, `ROUND_END_DELAY_MS = 1500`;
  - функції `emptyBoard(): Cell[]`, `otherMark(mark: Mark): Mark`, `findWinLine(board: Cell[]): WinLine | null`, `isBoardFull(board: Cell[]): boolean`.

- [x] **Step 1: Падаючі тести**

Порядок ліній і їхні назви — як у `legacy/helpers/checkWinner.ts`: спершу рядки, потім стовпці, потім діагоналі `[0,4,8]` і `[2,4,6]`; перемагає перша знайдена лінія.

```ts
// convex/rules.test.ts
import { describe, expect, test } from 'vitest';

import { type Cell, emptyBoard, findWinLine, isBoardFull, otherMark } from './rules';

// 'o' — circle, 'x' — cross, '.' — порожньо
const board = (cells: string): Cell[] => [ ...cells ].map(char => {
    if (char === 'o') {
        return 'circle';
    }

    return char === 'x' ? 'cross' : '';
});

const DRAW = 'oxooxxxoo';

describe('emptyBoard', () => {
    test('has nine empty cells', () => {
        expect(emptyBoard()).toEqual([ '', '', '', '', '', '', '', '', '' ]);
    });
});

describe('otherMark', () => {
    test('switches the mark', () => {
        expect(otherMark('circle')).toBe('cross');
        expect(otherMark('cross')).toBe('circle');
    });
});

describe('findWinLine', () => {
    test.each([
        [ 'ooo......', 'horizontal', [ 0, 1, 2 ] ],
        [ '...xxx...', 'horizontal', [ 3, 4, 5 ] ],
        [ '......ooo', 'horizontal', [ 6, 7, 8 ] ],
        [ 'x..x..x..', 'vertical', [ 0, 3, 6 ] ],
        [ '.o..o..o.', 'vertical', [ 1, 4, 7 ] ],
        [ '..x..x..x', 'vertical', [ 2, 5, 8 ] ],
        [ 'o...o...o', 'rotate_45', [ 0, 4, 8 ] ],
        [ '..x.x.x..', 'rotate_-45', [ 2, 4, 6 ] ]
    ])('%s wins by %s', (cells, line, winning) => {
        expect(findWinLine(board(cells))).toEqual({ line, cells: winning });
    });

    test('returns the first line in order when two lines are complete', () => {
        expect(findWinLine(board('oooo..o..'))).toEqual({ line: 'horizontal', cells: [ 0, 1, 2 ] });
    });

    test('returns null for mixed marks, an empty board and a draw', () => {
        expect(findWinLine(board('oxo......'))).toBeNull();
        expect(findWinLine(emptyBoard())).toBeNull();
        expect(findWinLine(board(DRAW))).toBeNull();
    });
});

describe('isBoardFull', () => {
    test('is true only when every cell is taken', () => {
        expect(isBoardFull(board(DRAW))).toBe(true);
        expect(isBoardFull(board('oxooxxxo.'))).toBe(false);
        expect(isBoardFull(emptyBoard())).toBe(false);
    });
});
```

- [x] **Step 2: Тести мають впасти**

Run: `npm run test:once -- --project convex convex/rules.test.ts`
Expected: FAIL з «Failed to resolve import "./rules"».

- [x] **Step 3: Реалізація**

```ts
// convex/rules.ts
export type Mark = 'circle' | 'cross';
export type Cell = Mark | '';
export type Line = 'horizontal' | 'vertical' | 'rotate_45' | 'rotate_-45';
export type WinLine = { line: Line, cells: number[] };

export const BOARD_SIZE = 9;
export const ROUND_END_DELAY_MS = 1500;

const LINES: { line: Line, cells: [ number, number, number ] }[] = [
    { line: 'horizontal', cells: [ 0, 1, 2 ] },
    { line: 'horizontal', cells: [ 3, 4, 5 ] },
    { line: 'horizontal', cells: [ 6, 7, 8 ] },
    { line: 'vertical', cells: [ 0, 3, 6 ] },
    { line: 'vertical', cells: [ 1, 4, 7 ] },
    { line: 'vertical', cells: [ 2, 5, 8 ] },
    { line: 'rotate_45', cells: [ 0, 4, 8 ] },
    { line: 'rotate_-45', cells: [ 2, 4, 6 ] }
];

export const emptyBoard = (): Cell[] => Array.from({ length: BOARD_SIZE }, (): Cell => '');

export const otherMark = (mark: Mark): Mark => (mark === 'circle' ? 'cross' : 'circle');

export const findWinLine = (board: Cell[]): WinLine | null => {
    for (const { line, cells } of LINES) {
        const [ a, b, c ] = cells;
        const mark = board[ a ];

        if (mark && mark === board[ b ] && mark === board[ c ]) {
            return { line, cells: [ ...cells ] };
        }
    }

    return null;
};

export const isBoardFull = (board: Cell[]): boolean => board.every(cell => cell !== '');
```

- [x] **Step 4: Тести проходять**

Run: `npm run lint:fix && npm run test:once -- --project convex`
Expected: PASS (rules + users).

- [x] **Step 5: Коміт**

```bash
git add convex/rules.ts convex/rules.test.ts
git commit -m "feat: add pure tic-tac-toe rules with draw detection"
```

---

### Task 4: Таблиця `games`, вхід у гру і читання стану

**Files:**
- Create: `convex/validators.ts`, `convex/games.ts`, `convex/games.test.ts`
- Modify: `convex/schema.ts`

**Interfaces:**
- Consumes: `emptyBoard`, `Mark` з `convex/rules.ts`; `setup`, `asUser` з `convex/test.setup.ts`.
- Produces:
  - `api.games.enter({ code: string, mark?: Mark }) → 'created' | 'joined' | 'already'`. Якщо гри немає, а `mark` переданий, гра створюється з автором у слоті `mark`. Якщо гри немає і `mark` немає → `ConvexError('Not game')`. Якщо гра є, викликач займає вільний слот (`mark` ігнорується), а якщо слотів немає → `ConvexError('Maximum number of players')`. Код, що не відповідає `/^[\w-]{1,64}$/`, дає `ConvexError('Invalid game ID')`; анонімний виклик — `ConvexError('Not authenticated')`.
  - `api.games.get({ code: string }) → GameView | null`, де `GameView = { code, board: Cell[], turn: Mark, result: Result | null, me: Mark, circle: PlayerView | null, cross: PlayerView | null }` і `PlayerView = { name: string, avatar: string, score: number }`. Для анонімів, сторонніх і неіснуючих кодів повертає `null`.
  - Внутрішні хелпери в `games.ts` для задач 5 і 6: `requireUserId(ctx)`, `findGame(ctx, code)`, `markOf(game, userId)`, `freshRound()`. Хелпери `requireGame` і `requireMark` з'являються в задачі 5, де їх уперше використовують: невикористаний код не пройде lint.
  - `Result = { kind: 'win', mark: Mark, line: Line, cells: number[] } | { kind: 'draw' }`.

- [x] **Step 1: Валідатори і схема**

```ts
// convex/validators.ts
import { v } from 'convex/values';

export const markValidator = v.union(v.literal('circle'), v.literal('cross'));

export const cellValidator = v.union(v.literal(''), markValidator);

export const lineValidator = v.union(
    v.literal('horizontal'),
    v.literal('vertical'),
    v.literal('rotate_45'),
    v.literal('rotate_-45')
);

export const playerValidator = v.object({
    userId: v.id('users'),
    score: v.number()
});

export const resultValidator = v.union(
    v.object({
        kind: v.literal('win'),
        mark: markValidator,
        line: lineValidator,
        cells: v.array(v.number())
    }),
    v.object({ kind: v.literal('draw') })
);
```

```ts
// convex/schema.ts
import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

import { cellValidator, markValidator, playerValidator, resultValidator } from './validators';

export default defineSchema({
    ...authTables,
    games: defineTable({
        code: v.string(),
        board: v.array(cellValidator),
        turn: markValidator,
        circle: v.union(playerValidator, v.null()),
        cross: v.union(playerValidator, v.null()),
        result: v.union(resultValidator, v.null())
    }).index('by_code', [ 'code' ])
});
```

- [x] **Step 2: Падаючі тести**

```ts
// convex/games.test.ts
import { describe, expect, test } from 'vitest';

import { api } from './_generated/api';
import { emptyBoard } from './rules';
import { asUser, setup } from './test.setup';

const CODE = 'game-1';

const startGame = async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');

    await alice.client.mutation(api.games.enter, { code: CODE, mark: 'circle' });
    await bob.client.mutation(api.games.enter, { code: CODE });

    return { t, alice, bob };
};

describe('enter', () => {
    test('creates a game with the creator in the chosen slot', async () => {
        const t = setup();
        const alice = await asUser(t, 'Alice');

        expect(await alice.client.mutation(api.games.enter, { code: CODE, mark: 'cross' })).toBe('created');
        expect(await alice.client.query(api.games.get, { code: CODE })).toEqual({
            code: CODE,
            board: emptyBoard(),
            turn: 'circle',
            result: null,
            me: 'cross',
            circle: null,
            cross: { name: 'Alice', avatar: 'https://example.com/Alice.png', score: 0 }
        });
    });

    test('rejects anonymous callers and malformed codes', async () => {
        const t = setup();
        const alice = await asUser(t, 'Alice');

        await expect(t.mutation(api.games.enter, { code: CODE, mark: 'circle' }))
            .rejects.toThrow('Not authenticated');
        await expect(alice.client.mutation(api.games.enter, { code: 'bad code!', mark: 'circle' }))
            .rejects.toThrow('Invalid game ID');
    });

    test('rejects an unknown code without a mark', async () => {
        const t = setup();
        const alice = await asUser(t, 'Alice');

        await expect(alice.client.mutation(api.games.enter, { code: CODE })).rejects.toThrow('Not game');
    });

    test('puts the second player into the free slot', async () => {
        const { bob } = await startGame();
        const game = await bob.client.query(api.games.get, { code: CODE });

        expect(game?.me).toBe('cross');
        expect(game?.circle?.name).toBe('Alice');
        expect(game?.cross?.name).toBe('Bob');
    });

    // Review Focus 1: той самий акаунт у двох вкладках
    test('returns already for a player who is in the game and keeps the other slot free', async () => {
        const t = setup();
        const alice = await asUser(t, 'Alice');

        await alice.client.mutation(api.games.enter, { code: CODE, mark: 'circle' });

        expect(await alice.client.mutation(api.games.enter, { code: CODE })).toBe('already');
        expect((await alice.client.query(api.games.get, { code: CODE }))?.cross).toBeNull();
    });

    test('rejects a third player', async () => {
        const { t } = await startGame();
        const carol = await asUser(t, 'Carol');

        await expect(carol.client.mutation(api.games.enter, { code: CODE }))
            .rejects.toThrow('Maximum number of players');
    });
});

describe('get', () => {
    test('hides the game from anonymous visitors, outsiders and unknown codes', async () => {
        const { t } = await startGame();
        const carol = await asUser(t, 'Carol');

        expect(await t.query(api.games.get, { code: CODE })).toBeNull();
        expect(await carol.client.query(api.games.get, { code: CODE })).toBeNull();
        expect(await carol.client.query(api.games.get, { code: 'missing' })).toBeNull();
    });
});
```

- [x] **Step 3: Тести мають впасти**

Run: `npm run test:once -- --project convex convex/games.test.ts`
Expected: FAIL, бо convex-test не знаходить модуль `games`.

- [x] **Step 4: Реалізація**

```ts
// convex/games.ts
import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError, v } from 'convex/values';

import type { Doc, Id } from './_generated/dataModel';
import { mutation, type MutationCtx, query, type QueryCtx } from './_generated/server';
import { emptyBoard, type Mark } from './rules';
import { markValidator } from './validators';

const CODE_PATTERN = /^[\w-]{1,64}$/;

const requireUserId = async (ctx: QueryCtx | MutationCtx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
        throw new ConvexError('Not authenticated');
    }

    return userId;
};

const findGame = (ctx: QueryCtx, code: string) => ctx.db
    .query('games')
    .withIndex('by_code', q => q.eq('code', code.trim()))
    .unique();

const markOf = (game: Doc<'games'>, userId: Id<'users'>): Mark | null => {
    if (game.circle?.userId === userId) {
        return 'circle';
    }

    if (game.cross?.userId === userId) {
        return 'cross';
    }

    return null;
};

const freshRound = () => ({
    board: emptyBoard(),
    turn: 'circle' as const,
    result: null
});

export const enter = mutation({
    args: {
        code: v.string(),
        mark: v.optional(markValidator)
    },
    handler: async (ctx, args) => {
        const userId = await requireUserId(ctx);
        const code = args.code.trim();

        if (!CODE_PATTERN.test(code)) {
            throw new ConvexError('Invalid game ID');
        }

        const game = await findGame(ctx, code);
        const player = { userId, score: 0 };

        if (!game) {
            if (!args.mark) {
                throw new ConvexError('Not game');
            }

            await ctx.db.insert('games', {
                code,
                ...freshRound(),
                circle: args.mark === 'circle' ? player : null,
                cross: args.mark === 'cross' ? player : null
            });

            return 'created' as const;
        }

        if (markOf(game, userId)) {
            return 'already' as const;
        }

        if (game.circle === null) {
            await ctx.db.patch('games', game._id, { circle: player });

            return 'joined' as const;
        }

        if (game.cross === null) {
            await ctx.db.patch('games', game._id, { cross: player });

            return 'joined' as const;
        }

        throw new ConvexError('Maximum number of players');
    }
});

export const get = query({
    args: { code: v.string() },
    handler: async (ctx, { code }) => {
        const userId = await getAuthUserId(ctx);

        if (userId === null) {
            return null;
        }

        const game = await findGame(ctx, code);
        const me = game ? markOf(game, userId) : null;

        if (!game || !me) {
            return null;
        }

        const loadPlayer = async (player: Doc<'games'>['circle']) => {
            if (!player) {
                return null;
            }

            const user = await ctx.db.get('users', player.userId);

            return {
                name: user?.name ?? '',
                avatar: user?.image ?? '',
                score: player.score
            };
        };

        return {
            code: game.code,
            board: game.board,
            turn: game.turn,
            result: game.result,
            me,
            circle: await loadPlayer(game.circle),
            cross: await loadPlayer(game.cross)
        };
    }
});
```

- [x] **Step 5: Тести проходять**

Run: `npm run lint:fix && npm run test:once -- --project convex && npm run typecheck`
Expected: PASS.

- [x] **Step 6: Коміт**

```bash
git add convex
git commit -m "feat: add games table with transactional enter and get"
```

---

### Task 5: Хід і завершення раунду

**Files:**
- Modify: `convex/games.ts`, `convex/games.test.ts`

**Interfaces:**
- Consumes: хелпери із задачі 4; `BOARD_SIZE`, `ROUND_END_DELAY_MS`, `findWinLine`, `isBoardFull`, `otherMark` з `rules.ts`.
- Produces:
  - хелпери `requireGame(ctx, code)` (`'Not game'`) і `requireMark(game, userId)` (`'Not a player'`) — їх використовує і задача 6;
  - `api.games.makeMove({ code: string, cell: number }) → null`. Помилки: `'Not a player'`, `'Waiting for the second player'`, `'Round is over'`, `'Not your turn'`, `'Invalid move'`.
    - Перемога: `result = { kind: 'win', mark, line, cells }`, рахунок `+1`, `turn` не змінюється.
    - Нічия: `result = { kind: 'draw' }`.
    - В обох випадках через `ROUND_END_DELAY_MS` запускається `internal.games.finishRound`.
  - `internal.games.finishRound({ gameId: Id<'games'> })`: якщо `result !== null`, ставить `freshRound()`, інакше нічого не робить.

- [x] **Step 1: Падаючі тести** (дописати в `games.test.ts`)

Імпорт `vitest` стає `import { afterEach, describe, expect, test, vi } from 'vitest';`.

```ts
afterEach(() => {
    vi.useRealTimers();
});

type Started = Awaited<ReturnType<typeof startGame>>;

// Alice — circle і ходить першою; далі ходи чергуються
const play = async ({ alice, bob }: Started, cells: number[]) => {
    for (const [ index, cell ] of cells.entries()) {
        const player = index % 2 === 0 ? alice : bob;

        await player.client.mutation(api.games.makeMove, { code: CODE, cell });
    }
};

describe('makeMove', () => {
    test('rejects a move before the second player joins', async () => {
        const t = setup();
        const alice = await asUser(t, 'Alice');

        await alice.client.mutation(api.games.enter, { code: CODE, mark: 'circle' });

        await expect(alice.client.mutation(api.games.makeMove, { code: CODE, cell: 0 }))
            .rejects.toThrow('Waiting for the second player');
    });

    test('rejects outsiders, moves out of turn and invalid cells', async () => {
        const game = await startGame();
        const carol = await asUser(game.t, 'Carol');

        await expect(carol.client.mutation(api.games.makeMove, { code: CODE, cell: 0 }))
            .rejects.toThrow('Not a player');
        await expect(game.bob.client.mutation(api.games.makeMove, { code: CODE, cell: 0 }))
            .rejects.toThrow('Not your turn');

        await play(game, [ 0 ]);

        await expect(game.alice.client.mutation(api.games.makeMove, { code: CODE, cell: 1 }))
            .rejects.toThrow('Not your turn');

        for (const cell of [ 0, 9, -1, 1.5 ]) {
            await expect(game.bob.client.mutation(api.games.makeMove, { code: CODE, cell }))
                .rejects.toThrow('Invalid move');
        }
    });

    test('places the mark and passes the turn', async () => {
        const game = await startGame();

        await play(game, [ 4 ]);

        const state = await game.alice.client.query(api.games.get, { code: CODE });

        expect(state?.board[ 4 ]).toBe('circle');
        expect(state?.turn).toBe('cross');
        expect(state?.result).toBeNull();
    });

    test('ends the round on a win and resets the board after the delay', async () => {
        vi.useFakeTimers();

        const game = await startGame();

        await play(game, [ 0, 3, 1, 4, 2 ]);

        const won = await game.alice.client.query(api.games.get, { code: CODE });

        expect(won?.result).toEqual({ kind: 'win', mark: 'circle', line: 'horizontal', cells: [ 0, 1, 2 ] });
        expect(won?.circle?.score).toBe(1);
        await expect(game.bob.client.mutation(api.games.makeMove, { code: CODE, cell: 8 }))
            .rejects.toThrow('Round is over');

        await game.t.finishAllScheduledFunctions(vi.runAllTimers);

        const next = await game.alice.client.query(api.games.get, { code: CODE });

        expect(next?.board).toEqual(emptyBoard());
        expect(next?.result).toBeNull();
        expect(next?.turn).toBe('circle');
        expect(next?.circle?.score).toBe(1);
    });

    test('ends the round on a draw without scoring', async () => {
        vi.useFakeTimers();

        const game = await startGame();

        await play(game, [ 0, 1, 2, 4, 3, 5, 7, 6, 8 ]);

        const drawn = await game.alice.client.query(api.games.get, { code: CODE });

        expect(drawn?.result).toEqual({ kind: 'draw' });
        expect(drawn?.circle?.score).toBe(0);
        expect(drawn?.cross?.score).toBe(0);

        await game.t.finishAllScheduledFunctions(vi.runAllTimers);

        expect((await game.alice.client.query(api.games.get, { code: CODE }))?.board).toEqual(emptyBoard());
    });
});
```

- [x] **Step 2: Тести мають впасти**

Run: `npm run test:once -- --project convex convex/games.test.ts`
Expected: FAIL, бо в модулі немає функції `makeMove`.

- [x] **Step 3: Реалізація** (дописати в `convex/games.ts`)

Імпорти стають такими:

```ts
import { internal } from './_generated/api';
import { internalMutation, mutation, type MutationCtx, query, type QueryCtx } from './_generated/server';
import {
    BOARD_SIZE,
    emptyBoard,
    findWinLine,
    isBoardFull,
    type Mark,
    otherMark,
    ROUND_END_DELAY_MS
} from './rules';
```

Хелпери ставляться після `findGame` і `markOf`:

```ts
const requireGame = async (ctx: QueryCtx, code: string) => {
    const game = await findGame(ctx, code);

    if (!game) {
        throw new ConvexError('Not game');
    }

    return game;
};

const requireMark = (game: Doc<'games'>, userId: Id<'users'>): Mark => {
    const mark = markOf(game, userId);

    if (!mark) {
        throw new ConvexError('Not a player');
    }

    return mark;
};
```

```ts
export const makeMove = mutation({
    args: {
        code: v.string(),
        cell: v.number()
    },
    handler: async (ctx, { code, cell }) => {
        const userId = await requireUserId(ctx);
        const game = await requireGame(ctx, code);
        const mark = requireMark(game, userId);

        if (!game.circle || !game.cross) {
            throw new ConvexError('Waiting for the second player');
        }

        if (game.result) {
            throw new ConvexError('Round is over');
        }

        if (game.turn !== mark) {
            throw new ConvexError('Not your turn');
        }

        if (!Number.isInteger(cell) || cell < 0 || cell >= BOARD_SIZE || game.board[ cell ] !== '') {
            throw new ConvexError('Invalid move');
        }

        const board = game.board.map((value, index) => (index === cell ? mark : value));
        const winLine = findWinLine(board);

        if (winLine) {
            await ctx.db.patch('games', game._id, {
                board,
                result: { kind: 'win', mark, ...winLine },
                ...(mark === 'circle'
                    ? { circle: { ...game.circle, score: game.circle.score + 1 } }
                    : { cross: { ...game.cross, score: game.cross.score + 1 } })
            });
            await ctx.scheduler.runAfter(ROUND_END_DELAY_MS, internal.games.finishRound, { gameId: game._id });

            return null;
        }

        if (isBoardFull(board)) {
            await ctx.db.patch('games', game._id, { board, result: { kind: 'draw' } });
            await ctx.scheduler.runAfter(ROUND_END_DELAY_MS, internal.games.finishRound, { gameId: game._id });

            return null;
        }

        await ctx.db.patch('games', game._id, { board, turn: otherMark(mark) });

        return null;
    }
});

export const finishRound = internalMutation({
    args: { gameId: v.id('games') },
    handler: async (ctx, { gameId }) => {
        const game = await ctx.db.get('games', gameId);

        // Раунд уже скинули вручну (Clear/New) або гру видалили
        if (!game || !game.result) {
            return;
        }

        await ctx.db.patch('games', gameId, freshRound());
    }
});
```

- [x] **Step 4: Тести проходять**

Run: `npm run lint:fix && npm run test:once -- --project convex && npm run typecheck`
Expected: PASS.

- [x] **Step 5: Коміт**

```bash
git add convex
git commit -m "feat: validate moves on the server and schedule round reset"
```

---

### Task 6: Clear, New і вихід із гри

**Files:**
- Modify: `convex/games.ts`, `convex/games.test.ts`

**Interfaces:**
- Produces:
  - `api.games.clearBoard({ code })`: будь-який учасник ставить `freshRound()`, рахунки не змінюються. Сторонньому — `'Not a player'`.
  - `api.games.newSession({ code })`: `freshRound()` і рахунки обох гравців `0`.
  - `api.games.leave({ code })`: викликача прибирає зі слоту, рахунок суперника стає `0`, ставиться `freshRound()`. Якщо викликач був у грі сам, гра видаляється. Для неіснуючої гри чи стороннього — тихо нічого не робить.

- [x] **Step 1: Падаючі тести** (дописати в `games.test.ts`)

```ts
describe('clearBoard and newSession', () => {
    test('clear keeps the scores', async () => {
        const game = await startGame();

        await play(game, [ 0, 3, 1, 4, 2 ]);
        await game.bob.client.mutation(api.games.clearBoard, { code: CODE });

        const state = await game.alice.client.query(api.games.get, { code: CODE });

        expect(state?.board).toEqual(emptyBoard());
        expect(state?.result).toBeNull();
        expect(state?.circle?.score).toBe(1);
    });

    // Review Focus 2: Clear у вікні 1.5 с після перемоги
    test('the scheduled reset does not wipe a round started after Clear', async () => {
        vi.useFakeTimers();

        const game = await startGame();

        await play(game, [ 0, 3, 1, 4, 2 ]);
        await game.alice.client.mutation(api.games.clearBoard, { code: CODE });
        await play(game, [ 4 ]);
        await game.t.finishAllScheduledFunctions(vi.runAllTimers);

        expect((await game.alice.client.query(api.games.get, { code: CODE }))?.board[ 4 ]).toBe('circle');
    });

    test('new session resets the scores', async () => {
        const game = await startGame();

        await play(game, [ 0, 3, 1, 4, 2 ]);
        await game.alice.client.mutation(api.games.newSession, { code: CODE });

        const state = await game.alice.client.query(api.games.get, { code: CODE });

        expect(state?.circle?.score).toBe(0);
        expect(state?.cross?.score).toBe(0);
        expect(state?.board).toEqual(emptyBoard());
    });

    test('outsiders cannot clear or restart', async () => {
        const { t } = await startGame();
        const carol = await asUser(t, 'Carol');

        await expect(carol.client.mutation(api.games.clearBoard, { code: CODE })).rejects.toThrow('Not a player');
        await expect(carol.client.mutation(api.games.newSession, { code: CODE })).rejects.toThrow('Not a player');
    });
});

describe('leave', () => {
    // Review Focus 3: суперник виходить посеред раунду
    test('frees the slot, resets the round and the scores, and blocks the leaver', async () => {
        const game = await startGame();

        await play(game, [ 0, 3, 1, 4, 2 ]);
        await game.bob.client.mutation(api.games.leave, { code: CODE });

        const state = await game.alice.client.query(api.games.get, { code: CODE });

        expect(state?.cross).toBeNull();
        expect(state?.circle?.score).toBe(0);
        expect(state?.board).toEqual(emptyBoard());
        expect(await game.bob.client.query(api.games.get, { code: CODE })).toBeNull();
        await expect(game.bob.client.mutation(api.games.makeMove, { code: CODE, cell: 0 }))
            .rejects.toThrow('Not a player');

        const carol = await asUser(game.t, 'Carol');

        expect(await carol.client.mutation(api.games.enter, { code: CODE })).toBe('joined');
    });

    test('deletes the game when the last player leaves', async () => {
        const t = setup();
        const alice = await asUser(t, 'Alice');

        await alice.client.mutation(api.games.enter, { code: CODE, mark: 'circle' });
        await alice.client.mutation(api.games.leave, { code: CODE });

        await expect(alice.client.mutation(api.games.enter, { code: CODE })).rejects.toThrow('Not game');
    });

    test('ignores unknown games', async () => {
        const t = setup();
        const alice = await asUser(t, 'Alice');

        await expect(alice.client.mutation(api.games.leave, { code: 'missing' })).resolves.toBeNull();
    });
});
```

- [x] **Step 2: Тести мають впасти**

Run: `npm run test:once -- --project convex convex/games.test.ts`
Expected: FAIL, бо в модулі немає `clearBoard`, `newSession` і `leave`.

- [x] **Step 3: Реалізація** (дописати в `convex/games.ts`)

```ts
const resetScore = (player: Doc<'games'>['circle']) => (player ? { ...player, score: 0 } : null);

export const clearBoard = mutation({
    args: { code: v.string() },
    handler: async (ctx, { code }) => {
        const userId = await requireUserId(ctx);
        const game = await requireGame(ctx, code);

        requireMark(game, userId);
        await ctx.db.patch('games', game._id, freshRound());

        return null;
    }
});

export const newSession = mutation({
    args: { code: v.string() },
    handler: async (ctx, { code }) => {
        const userId = await requireUserId(ctx);
        const game = await requireGame(ctx, code);

        requireMark(game, userId);
        await ctx.db.patch('games', game._id, {
            ...freshRound(),
            circle: resetScore(game.circle),
            cross: resetScore(game.cross)
        });

        return null;
    }
});

export const leave = mutation({
    args: { code: v.string() },
    handler: async (ctx, { code }) => {
        const userId = await requireUserId(ctx);
        const game = await findGame(ctx, code);
        const mark = game ? markOf(game, userId) : null;

        if (!game || !mark) {
            return null;
        }

        if (game[ otherMark(mark) ] === null) {
            await ctx.db.delete('games', game._id);

            return null;
        }

        await ctx.db.patch('games', game._id, {
            ...freshRound(),
            circle: mark === 'circle' ? null : resetScore(game.circle),
            cross: mark === 'cross' ? null : resetScore(game.cross)
        });

        return null;
    }
});
```

- [x] **Step 4: Тести проходять**

Run: `npm run lint:fix && npm run test:once -- --project convex && npm run typecheck`
Expected: PASS, усі тести convex.

- [x] **Step 5: Коміт**

```bash
git add convex
git commit -m "feat: add clear, new session and leave mutations"
```

---

### Task 7: Каркас застосунку: провайдери, шапка, модалка, логін

**Files:**
- Create:
  - `src/main.tsx` (перезапис), `src/App.tsx`
  - `src/lib/errorMessage.ts`, `src/hooks/useEscapeKey.ts`
  - компоненти з `index.ts`: `src/components/{Overlay,Container,Button,Spinner,Modal,UserMenu,NavBar}/`
  - `src/routes/{PrivateRoute,PublicRoute}/`
  - `src/pages/LoginPage/`, `src/pages/HomePage/` (тимчасовий, задача 8 перепише)

**Interfaces:**
- Consumes: `api.users.me`, `api.games.leave`, `cn`.
- Produces:
  - `errorMessage(error: unknown): string`;
  - `useEscapeKey(handler: () => void): void` (Escape плюс блокування скролу `body`, як у старому `useKeyDown`);
  - компоненти `Overlay({ children?, className?, onClick? })`, `Button({ children, className?, type?, onClick? })`, `Spinner()`, `Container({ children })`, `Modal({ children, onClose, onOk })`, `UserMenu({ gameCode, onClose, onGoHome, onLogOut })`, `NavBar()`;
  - маршрути `PrivateRoute({ children })` (передає `state.from = pathname + search` на `/login`) і `PublicRoute({ children, restricted? })`.

**Відповідність класів (SCSS → Tailwind):**

| Було | Стало |
|---|---|
| `.app-bg` | `relative mx-auto flex h-full min-h-screen max-w-480 flex-col bg-linear-to-r/srgb from-stone-300` (`/srgb` — бо Tailwind 3 інтерполював градієнт у sRGB) |
| `.app-bg__image` | `absolute -z-1 h-full w-full object-cover` |
| `.c-container` | `mx-auto flex w-full grow items-center justify-center p-5` |
| `.c-overlay` | `fixed inset-0 z-20 flex items-center justify-center bg-black/70` |
| `.c-overlay--menu` | Overlay + `z-21 block bg-transparent` |
| `.c-button` | `bg-blue-50 px-4 py-1 text-2xl uppercase transition hover:bg-blue-200` |
| `.c-button--login-google` | Button + `px-8 py-4` |
| `.c-header` | `flex items-center justify-between gap-x-5 border-b-4 border-black bg-linear-to-r/srgb from-blue-dark px-5 py-3` |
| `.c-header__title` | `cn([ 'text-2xl font-semibold text-white uppercase', 'md:text-3xl' ])` |
| `.c-header__menu` | `flex items-center gap-x-5` |
| `.c-header__button` | Button + `px-3.5 py-0.5 text-lg` |
| `.c-select` | `relative` |
| `.c-select__dropdown` / `-inner` / `__list` | `absolute right-0 z-50` / `mt-2.5 min-w-30 max-w-[calc(100vw-40px)] bg-blue-50` / `m-0 list-none p-0` |
| `.c-select__item` 1 / 2 / 3–4 | `px-4 text-base leading-loose whitespace-nowrap text-black` / `border-b border-black px-4 text-lg leading-loose whitespace-nowrap text-black` / `cursor-pointer px-4 text-lg leading-loose whitespace-nowrap text-black transition hover:bg-blue-dark hover:text-white`; кнопка всередині — `w-full text-left` |
| `.c-modal` | `flex w-[85vw] max-w-125 flex-col gap-y-10 border border-white bg-blue-dark p-5` |
| `.c-modal__close-button` | `relative z-21 flex h-8 w-8 items-center justify-center self-end bg-blue-50 transition hover:bg-blue-200 before:absolute before:h-0.5 before:w-4/5 before:rotate-45 before:bg-black after:absolute after:h-0.5 after:w-4/5 after:-rotate-45 after:bg-black` |
| `.c-modal__content` / `__button-wrapper` | `text-center text-3xl text-white` / `flex flex-wrap justify-around gap-5` |

- [x] **Step 1: Утиліти**

```ts
// src/lib/errorMessage.ts
import { ConvexError } from 'convex/values';

export default (error: unknown): string => {
    if (error instanceof ConvexError && typeof error.data === 'string') {
        return error.data;
    }

    return 'Something went wrong';
};
```

```ts
// src/hooks/useEscapeKey.ts
import { useEffect, useEffectEvent } from 'react';

const useEscapeKey = (handler: () => void) => {
    const onEscape = useEffectEvent(handler);

    useEffect(
        () => {
            const onKeyDown = (event: KeyboardEvent) => {
                if (event.code === 'Escape') {
                    onEscape();
                }
            };

            window.addEventListener('keydown', onKeyDown);
            document.body.style.overflow = 'hidden';

            return () => {
                window.removeEventListener('keydown', onKeyDown);
                document.body.style.overflow = 'auto';
            };
        },
        []
    );
};

export default useEscapeKey;
```

- [x] **Step 2: Базові компоненти**

Кожен компонент лежить у своїй теці з `index.ts`: `export { default } from './Overlay';` тощо.

```tsx
// src/components/Overlay/Overlay.tsx
import type { FC, MouseEvent, ReactNode } from 'react';

import cn from '@/lib/cn';

type OverlayProps = {
    children?: ReactNode,
    className?: string,
    onClick?: (event: MouseEvent<HTMLDivElement>) => void
};

const Overlay: FC<OverlayProps> = ({ children, className, onClick }) => (
    <div
        className={ cn('fixed inset-0 z-20 flex items-center justify-center bg-black/70', className) }
        onClick={ onClick }
    >
        { children }
    </div>
);

export default Overlay;
```

```tsx
// src/components/Container/Container.tsx
import type { FC, ReactNode } from 'react';

const Container: FC<{ children: ReactNode }> = ({ children }) => (
    <main className="mx-auto flex w-full grow items-center justify-center p-5">
        { children }
    </main>
);

export default Container;
```

```tsx
// src/components/Button/Button.tsx
import type { FC, ReactNode } from 'react';

import cn from '@/lib/cn';

type ButtonProps = {
    children: ReactNode,
    className?: string,
    type?: 'button' | 'submit',
    onClick?: () => void
};

const Button: FC<ButtonProps> = ({ children, className, type = 'button', onClick }) => (
    <button
        type={ type }
        className={ cn('bg-blue-50 px-4 py-1 text-2xl uppercase transition hover:bg-blue-200', className) }
        onClick={ onClick }
    >
        { children }
    </button>
);

export default Button;
```

```tsx
// src/components/Spinner/Spinner.tsx
import type { FC } from 'react';
import { Oval } from 'react-loader-spinner';

import Overlay from '@/components/Overlay';

const Spinner: FC = () => (
    <Overlay>
        <Oval
            height={ 100 }
            width={ 100 }
            color="#bfdbfe"
            secondaryColor="#bfdbfe"
            strokeWidth={ 4 }
            strokeWidthSecondary={ 4 }
            ariaLabel="oval-loading"
        />
    </Overlay>
);

export default Spinner;
```

- [x] **Step 3: Модалка і меню**

```tsx
// src/components/Modal/Modal.tsx
import type { FC, MouseEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';

import Button from '@/components/Button';
import Overlay from '@/components/Overlay';
import useEscapeKey from '@/hooks/useEscapeKey';

type ModalProps = {
    children: ReactNode,
    onClose: () => void,
    onOk: () => void
};

const Modal: FC<ModalProps> = ({ children, onClose, onOk }) => {
    useEscapeKey(onClose);

    const onClickBackdrop = (event: MouseEvent<HTMLDivElement>) => {
        if (event.currentTarget === event.target) {
            onClose();
        }
    };

    return createPortal(
        <Overlay onClick={ onClickBackdrop }>
            <div className="flex w-[85vw] max-w-125 flex-col gap-y-10 border border-white bg-blue-dark p-5">
                <button
                    type="button"
                    aria-label="Close modal"
                    className="relative z-21 flex h-8 w-8 items-center justify-center self-end bg-blue-50 transition before:absolute before:h-0.5 before:w-4/5 before:rotate-45 before:bg-black after:absolute after:h-0.5 after:w-4/5 after:-rotate-45 after:bg-black hover:bg-blue-200"
                    onClick={ onClose }
                />
                <div className="text-center text-3xl text-white">
                    { children }
                </div>
                <div className="flex flex-wrap justify-around gap-5">
                    <Button onClick={ onOk }>Ok</Button>
                    <Button onClick={ onClose }>Cancel</Button>
                </div>
            </div>
        </Overlay>,
        document.getElementById('root-modal')!
    );
};

export default Modal;
```

```tsx
// src/components/UserMenu/UserMenu.tsx
import { useQuery } from 'convex/react';
import type { FC, MouseEvent } from 'react';

import Overlay from '@/components/Overlay';
import useEscapeKey from '@/hooks/useEscapeKey';
import { api } from '@convex/_generated/api';

const ITEM = 'px-4 text-lg leading-loose whitespace-nowrap text-black';
const ACTION = `${ ITEM } cursor-pointer transition hover:bg-blue-dark hover:text-white`;

type UserMenuProps = {
    gameCode: string,
    onClose: () => void,
    onGoHome: () => void,
    onLogOut: () => void
};

const UserMenu: FC<UserMenuProps> = ({ gameCode, onClose, onGoHome, onLogOut }) => {
    const me = useQuery(api.users.me);

    useEscapeKey(onClose);

    const onClickOutside = (event: MouseEvent<HTMLDivElement>) => {
        if (event.currentTarget === event.target) {
            onClose();
        }
    };

    return (
        <>
            <div className="absolute right-0 z-50">
                <div className="mt-2.5 min-w-30 max-w-[calc(100vw-40px)] bg-blue-50">
                    <ul className="m-0 list-none p-0">
                        <li className="px-4 text-base leading-loose whitespace-nowrap text-black">
                            { gameCode }
                        </li>
                        <li className={ `${ ITEM } border-b border-black` }>
                            { me?.name }
                        </li>
                        <li className={ ACTION }>
                            <button
                                type="button"
                                className="w-full text-left"
                                onClick={ onGoHome }
                            >
                                Home
                            </button>
                        </li>
                        <li className={ ACTION }>
                            <button
                                type="button"
                                className="w-full text-left"
                                onClick={ onLogOut }
                            >
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
            <Overlay
                className="z-21 block bg-transparent"
                onClick={ onClickOutside }
            />
        </>
    );
};

export default UserMenu;
```

Константи `ITEM` і `ACTION` — це повні рядки класів, тож сканер Tailwind їх бачить. Шаблонний рядок тут безпечний: інтерполюється константа, а не обрізок класу.

- [x] **Step 4: Шапка**

Логіка `onOk`: закрити модалку, перейти на `/`, вийти з гри (якщо стоїмо на `/game/:id`), а для `logOut` ще й `signOut()`. Навігація йде до `leave`, щоб сторінка гри не встигла показати спінер для гри, якої для нас уже немає.

```tsx
// src/components/NavBar/NavBar.tsx
import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth, useMutation } from 'convex/react';
import { type FC, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useMatch, useNavigate } from 'react-router';

import Button from '@/components/Button';
import Modal from '@/components/Modal';
import UserMenu from '@/components/UserMenu';
import cn from '@/lib/cn';
import errorMessage from '@/lib/errorMessage';
import { api } from '@convex/_generated/api';

type ModalType = 'logOut' | 'goHome';

const HEADER_BUTTON = 'px-3.5 py-0.5 text-lg';

const NavBar: FC = () => {
    const { isAuthenticated } = useConvexAuth();
    const { signOut } = useAuthActions();
    const leave = useMutation(api.games.leave);
    const matchLogin = useMatch('/login');
    const matchGame = useMatch('/game/:gameId');
    const navigate = useNavigate();
    const [ isMenu, setIsMenu ] = useState(false);
    const [ modalType, setModalType ] = useState<ModalType | null>(null);

    const gameCode = matchGame?.params.gameId;

    const openModal = (type: ModalType) => {
        setModalType(type);
        setIsMenu(false);
    };

    const onOk = async () => {
        const type = modalType;

        setModalType(null);
        navigate('/');

        try {
            if (gameCode) {
                await leave({ code: gameCode });
            }

            if (type === 'logOut') {
                await signOut();
            }
        } catch (error) {
            toast.error(errorMessage(error));
        }
    };

    return (
        <div>
            <header className="flex items-center justify-between gap-x-5 border-b-4 border-black bg-linear-to-r/srgb from-blue-dark px-5 py-3">
                <Link to="/">
                    <h1
                        className={
                            cn([
                                'text-2xl font-semibold text-white uppercase',
                                'md:text-3xl'
                            ])
                        }
                    >
                        Tic-Tac-Toe
                    </h1>
                </Link>
                <div className="flex items-center gap-x-5">
                    { isAuthenticated && gameCode && (
                        <div className="relative">
                            <Button
                                className={ HEADER_BUTTON }
                                onClick={
                                    () => {
                                        setIsMenu(!isMenu);
                                    }
                                }
                            >
                                Menu
                            </Button>
                            { isMenu && (
                                <UserMenu
                                    gameCode={ gameCode }
                                    onClose={
                                        () => {
                                            setIsMenu(false);
                                        }
                                    }
                                    onGoHome={
                                        () => {
                                            openModal('goHome');
                                        }
                                    }
                                    onLogOut={
                                        () => {
                                            openModal('logOut');
                                        }
                                    }
                                />
                            ) }
                        </div>
                    ) }
                    { isAuthenticated && !gameCode && (
                        <Button
                            className={ HEADER_BUTTON }
                            onClick={
                                () => {
                                    openModal('logOut');
                                }
                            }
                        >
                            Logout
                        </Button>
                    ) }
                    { !isAuthenticated && (
                        <Link to={ matchLogin ? '/' : '/login' }>
                            <Button className={ HEADER_BUTTON }>
                                { matchLogin ? 'Home' : 'Login' }
                            </Button>
                        </Link>
                    ) }
                </div>
            </header>
            { modalType && (
                <Modal
                    onOk={ onOk }
                    onClose={
                        () => {
                            setModalType(null);
                        }
                    }
                >
                    { modalType === 'logOut'
                        ? 'Are you sure what you want to go out? '
                        : 'Are you sure you want to go to the home page? ' }
                    The current game will be ended!
                </Modal>
            ) }
        </div>
    );
};

export default NavBar;
```

- [x] **Step 5: Маршрути і логін**

```tsx
// src/routes/PrivateRoute/PrivateRoute.tsx
import { useConvexAuth } from 'convex/react';
import type { FC, ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router';

const PrivateRoute: FC<{ children: ReactElement }> = ({ children }) => {
    const { isAuthenticated } = useConvexAuth();
    const location = useLocation();

    if (isAuthenticated) {
        return children;
    }

    return (
        <Navigate
            to="/login"
            state={ { from: location.pathname + location.search } }
            replace
        />
    );
};

export default PrivateRoute;
```

```tsx
// src/routes/PublicRoute/PublicRoute.tsx
import { useConvexAuth } from 'convex/react';
import type { FC, ReactElement } from 'react';
import { Navigate } from 'react-router';

type PublicRouteProps = {
    children: ReactElement,
    restricted?: boolean
};

const PublicRoute: FC<PublicRouteProps> = ({ children, restricted = false }) => {
    const { isAuthenticated } = useConvexAuth();

    return isAuthenticated && restricted ? <Navigate to="/" replace /> : children;
};

export default PublicRoute;
```

```tsx
// src/pages/LoginPage/LoginPage.tsx
import { useAuthActions } from '@convex-dev/auth/react';
import type { FC } from 'react';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router';

import Button from '@/components/Button';
import errorMessage from '@/lib/errorMessage';

const LoginPage: FC = () => {
    const { signIn } = useAuthActions();
    const location = useLocation();
    const from = (location.state as { from?: string } | null)?.from ?? '/';

    // Google OAuth іде повним редиректом і повертає на `from` (той самий /game/:id, якщо прийшли з посилання)
    const onLogin = () => {
        signIn('google', { redirectTo: from }).catch((error: unknown) => {
            toast.error(errorMessage(error));
        });
    };

    return (
        <Button
            className="px-8 py-4"
            onClick={ onLogin }
        >
            Login with google
        </Button>
    );
};

export default LoginPage;
```

```tsx
// src/pages/HomePage/HomePage.tsx (тимчасовий, задача 8 перепише цілком)
import type { FC } from 'react';

const HomePage: FC = () => <h2 className="text-center text-4xl font-semibold uppercase">Authorization</h2>;

export default HomePage;
```

- [x] **Step 6: `App.tsx` і `main.tsx`**

```tsx
// src/App.tsx
import { useConvexAuth } from 'convex/react';
import type { FC } from 'react';
import { Toaster } from 'react-hot-toast';
import { Navigate, Route, Routes } from 'react-router';

import bg from '@/assets/bg.jpg';
import Container from '@/components/Container';
import NavBar from '@/components/NavBar';
import Spinner from '@/components/Spinner';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import PublicRoute from '@/routes/PublicRoute';

const App: FC = () => {
    const { isLoading } = useConvexAuth();

    return (
        <div className="relative mx-auto flex h-full min-h-screen max-w-480 flex-col bg-linear-to-r/srgb from-stone-300">
            <img
                src={ bg }
                alt="Фон"
                className="absolute -z-1 h-full w-full object-cover"
            />
            <Toaster position="top-right" />
            { isLoading
                ? <Spinner />
                : (
                    <>
                        <NavBar />
                        <Container>
                            <Routes>
                                <Route
                                    path="/"
                                    element={ <PublicRoute><HomePage /></PublicRoute> }
                                />
                                <Route
                                    path="/login"
                                    element={ <PublicRoute restricted><LoginPage /></PublicRoute> }
                                />
                                <Route
                                    path="*"
                                    element={ <Navigate to="/" replace /> }
                                />
                            </Routes>
                        </Container>
                    </>
                ) }
        </div>
    );
};

export default App;
```

```tsx
// src/main.tsx
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { ConvexReactClient } from 'convex/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import App from '@/App';

import '@/index.css';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ConvexAuthProvider client={ convex }>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ConvexAuthProvider>
    </StrictMode>
);
```

- [x] **Step 7: Автоматичні перевірки**

Run: `npm run lint:fix && npm run lint && npm run typecheck && npm run test:once`
Expected: усе зелене.

- [x] **Step 8: Ручна перевірка** (`npm run dev` + `npm run dev:convex`)

Очікується:
- на `/` шапка з градієнтом і кнопкою LOGIN, фон як у старій версії;
- `/login` показує кнопку LOGIN WITH GOOGLE і кнопку HOME у шапці;
- після входу через Google повертаєшся на `/`, у шапці кнопка LOGOUT;
- LOGOUT відкриває модалку: Esc, клік по фону, хрестик і CANCEL її закривають; OK виходить з акаунта;
- курсор-рука на кнопках, hover на кнопках світло-блакитний.

- [x] **Step 9: Коміт**

```bash
git add -A
git commit -m "feat: add app shell with Convex auth, header, modal and login"
```

---

### Task 8: Головна сторінка (новий/приєднатися)

**Files:**
- Create: `src/components/RadioInput/` (компонент + `index.ts`)
- Modify: `src/pages/HomePage/HomePage.tsx` (перезапис)

**Interfaces:**
- Consumes: `Button`, `Mark` з `@convex/rules`.
- Produces: перехід на `/game/:code?mark=<mark>` для нової гри і на `/game/:code` для приєднання. Сторінку гри з цими адресами робить задача 9.

**Відповідність класів:**

| Було | Стало |
|---|---|
| `.c-home` / `__title` | `flex w-full max-w-105 flex-col items-center gap-y-10` / `text-center text-4xl font-semibold uppercase` |
| `__choice` / `-type` / `-new` / `-new-turn` / `-join` | `flex w-full flex-col gap-y-5` / `flex items-center gap-x-5` / `flex flex-col gap-y-5 pl-5` / `flex items-center gap-x-5` / `pl-5` |
| `__generate-id` / `-button` / `-text` | `flex flex-col gap-y-5` / Button + `w-fit px-2 py-0.5 text-lg font-semibold` / `text-2xl font-semibold text-white` |
| `__button` | Button + `mx-auto w-full max-w-80` |
| `.c-text` / `__label` / `__input` | `text-lg leading-snug font-semibold` / `mb-2.5 inline-block cursor-pointer uppercase` / `w-full rounded-none border border-white bg-white px-3 py-1.5 leading-6.5 outline-0 transition placeholder:text-black placeholder:opacity-30 focus:border-black focus:outline-1 focus:outline-black` |
| `.c-radio` / `__input` / `__label` | `group relative leading-6` / `absolute h-0 w-0 p-0 opacity-0` / `inline-flex cursor-pointer pl-8 text-lg leading-snug font-semibold uppercase` |
| `.c-radio__icon` + `:checked + label &:after` | `absolute left-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-black after:block after:h-3 after:w-3 after:rounded-full after:bg-black after:opacity-0 after:transition group-has-checked:after:opacity-100` |

Іконка лежить усередині `label`, тобто не є сусідом `input`, тому `peer-checked:` не спрацює. Замість нього `group` на обгортці і `group-has-checked:`.

- [x] **Step 1: RadioInput**

```tsx
// src/components/RadioInput/RadioInput.tsx
import type { FC } from 'react';

type RadioInputProps = {
    id: string,
    name: string,
    value: string,
    label: string,
    checked: boolean,
    onChange: () => void
};

const RadioInput: FC<RadioInputProps> = ({ id, name, value, label, checked, onChange }) => (
    <div className="group relative leading-6">
        <input
            id={ id }
            type="radio"
            name={ name }
            value={ value }
            checked={ checked }
            className="absolute h-0 w-0 p-0 opacity-0"
            onChange={ onChange }
        />
        <label
            htmlFor={ id }
            className="inline-flex cursor-pointer pl-8 text-lg leading-snug font-semibold uppercase"
        >
            <span className="absolute left-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-black after:block after:h-3 after:w-3 after:rounded-full after:bg-black after:opacity-0 after:transition group-has-checked:after:opacity-100" />
            { label }
        </label>
    </div>
);

export default RadioInput;
```

- [x] **Step 2: HomePage**

```tsx
// src/pages/HomePage/HomePage.tsx
import { nanoid } from 'nanoid';
import { type FC, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';

import Button from '@/components/Button';
import RadioInput from '@/components/RadioInput';
import type { Mark } from '@convex/rules';

type GameType = 'new' | 'join';

const HomePage: FC = () => {
    const [ type, setType ] = useState<GameType>('new');
    const [ code, setCode ] = useState('');
    const [ mark, setMark ] = useState<Mark>('circle');
    const navigate = useNavigate();

    const onStart = () => {
        const trimmed = code.trim();

        if (!trimmed) {
            toast.error(type === 'new' ? 'Generate Game ID first' : 'Enter the game ID');

            return;
        }

        const path = `/game/${ encodeURIComponent(trimmed) }`;

        navigate(type === 'new' ? `${ path }?mark=${ mark }` : path);
    };

    return (
        <div className="flex w-full max-w-105 flex-col items-center gap-y-10">
            <h2 className="text-center text-4xl font-semibold uppercase">Authorization</h2>
            <div className="flex w-full flex-col gap-y-5">
                <div className="flex items-center gap-x-5">
                    <RadioInput
                        id="newGame"
                        name="type"
                        value="new"
                        label="New game"
                        checked={ type === 'new' }
                        onChange={
                            () => {
                                setType('new');
                            }
                        }
                    />
                    <RadioInput
                        id="joinGame"
                        name="type"
                        value="join"
                        label="Join the game"
                        checked={ type === 'join' }
                        onChange={
                            () => {
                                setType('join');
                            }
                        }
                    />
                </div>
                { type === 'new' && (
                    <div className="flex flex-col gap-y-5 pl-5">
                        <div className="flex items-center gap-x-5">
                            <RadioInput
                                id="circleTurn"
                                name="turn"
                                value="circle"
                                label="Circle"
                                checked={ mark === 'circle' }
                                onChange={
                                    () => {
                                        setMark('circle');
                                    }
                                }
                            />
                            <RadioInput
                                id="crossTurn"
                                name="turn"
                                value="cross"
                                label="Cross"
                                checked={ mark === 'cross' }
                                onChange={
                                    () => {
                                        setMark('cross');
                                    }
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-y-5">
                            <Button
                                className="w-fit px-2 py-0.5 text-lg font-semibold"
                                onClick={
                                    () => {
                                        setCode(nanoid());
                                    }
                                }
                            >
                                Generate Game ID
                            </Button>
                            { code && <p className="text-2xl font-semibold text-white">{ code }</p> }
                        </div>
                    </div>
                ) }
                { type === 'join' && (
                    <div className="pl-5">
                        <div className="text-lg leading-snug font-semibold">
                            <label
                                htmlFor="idGame"
                                className="mb-2.5 inline-block cursor-pointer uppercase"
                            >
                                Enter the game ID
                            </label>
                            <input
                                id="idGame"
                                type="text"
                                placeholder="Enter the game ID"
                                value={ code }
                                className="w-full rounded-none border border-white bg-white px-3 py-1.5 leading-6.5 outline-0 transition placeholder:text-black placeholder:opacity-30 focus:border-black focus:outline-1 focus:outline-black"
                                onChange={
                                    event => {
                                        setCode(event.target.value);
                                    }
                                }
                            />
                        </div>
                    </div>
                ) }
            </div>
            <Button
                type="submit"
                className="mx-auto w-full max-w-80"
                onClick={ onStart }
            >
                Start
            </Button>
        </div>
    );
};

export default HomePage;
```

- [x] **Step 3: Перевірки**

Run: `npm run lint:fix && npm run lint && npm run typecheck`
Expected: зелене.

Ручна перевірка поруч із `legacy/` (старий вигляд — у `legacy/styles`):
- радіокнопки показують чорну крапку тільки на вибраному варіанті й плавно перемикаються;
- GENERATE GAME ID показує білий ID під кнопкою;
- у режимі JOIN поле фокусується з чорною рамкою, плейсхолдер блідий;
- START з порожнім ID показує toast, а з ID переходить на `/game/<id>?mark=circle` (поки що з редиректом на `/`, бо маршруту гри ще немає).

- [x] **Step 4: Коміт**

```bash
git add src
git commit -m "feat: port home page to inline Tailwind"
```

---

### Task 9: Сторінка гри

**Files:**
- Create: `src/types/game.ts`, `src/lib/motion.ts`
- Create: компоненти з `index.ts` — `src/components/{Fade,FadeSwitch,MarkIcon,Player,Statistics,Waiting}/`, `src/components/Cell/` (`Cell.tsx`, `winLine.ts`, `winLine.test.ts`, `index.ts`)
- Create: `src/pages/GamePage/` (компонент + `index.ts`)
- Modify: `src/App.tsx` (маршрут гри)

**Interfaces:**
- Consumes: `api.games.get / enter / makeMove / clearBoard / newSession`, типи з `@convex/rules`, `Button`, `Overlay`, `Spinner`, `cn`, `errorMessage`.
- Produces:
  - `GameView`, `PlayerView` (`src/types/game.ts`);
  - `winLineClassName(line: Line, index: number): string`;
  - `Fade({ show, className?, children? })` (150 мс), `FadeSwitch({ switchKey, children? })` (75 мс, out-in);
  - `MarkIcon({ mark })`, `Player({ mark, player })`, `Statistics({ turn, result })`, `Waiting({ code })`, `Cell({ index, value, winLine, onSelect })`.

**Відповідність класів:**

| Було | Стало |
|---|---|
| `.c-app` | `cn([ 'w-full', 'md:w-175' ])` |
| `.c-app__player-wrapper` | `cn([ 'mb-2.5 flex flex-col gap-y-5 border-b-2 pb-2.5', 'md:mb-5 md:pb-5' ])` |
| `.c-app__board.c-board` | `cn([ 'mx-auto my-8 grid h-60 w-60 grid-cols-3 grid-rows-3 gap-0.5 bg-black', 'md:h-125 md:w-125' ])` |
| `.c-app__button-wrapper` / `__button` | `flex justify-evenly` / Button + `basis-1/3` |
| `.c-board__cell` | `relative flex cursor-pointer items-center justify-center bg-blue-50 transition hover:bg-blue-200` (+ `pointer-events-none`, якщо клітинка зайнята) |
| `-circle` / `-cross-wrapper` / `-cross` | `h-3/4 w-3/4 rounded-full border-4 border-green` / `relative -top-0.5 w-full` / `absolute h-1 w-full bg-red` + `rotate-45` / `-rotate-45` |
| `-active` і модифікатори, `nth-child`-правила | `winLineClassName` (нижче) |
| `.c-player` | `cn([ 'flex items-center gap-x-5', 'md:gap-x-8' ])` |
| `__avatar` | `cn([ 'ml-2.5 h-7 w-7 overflow-hidden rounded-full border border-white', 'md:ml-5 md:h-10 md:w-10' ])`, `img` — `h-full w-full object-cover` |
| `__title` | `cn([ 'mr-auto max-w-37.5 truncate text-2xl font-semibold', 'md:max-w-105 md:text-4xl md:leading-tight' ])` |
| `__score` | `cn([ 'w-9 text-right text-3xl leading-none font-semibold', 'md:w-14 md:text-5xl' ])` |
| `__type-1` | `cn([ 'h-8 w-8 rounded-full border-4 border-green', 'md:h-11 md:w-11' ])` |
| `__type-2` / `-inner` | `cn([ 'relative flex h-8 w-8 items-center justify-center', 'md:h-11 md:w-11' ])` / `cn([ 'absolute h-1 w-10 bg-red', 'md:w-14' ])` + `rotate-45` / `-rotate-45` |
| `.c-statistics` / `__title` | `flex items-center justify-end gap-x-5` / `cn([ 'flex items-center gap-x-5 text-2xl font-semibold', 'md:text-4xl' ])` |
| `.c-overlay--waiting` | Overlay + `top-15 bg-transparent` |
| `.c-waiting` / `__title` / `__text` | `flex w-[85vw] max-w-100 flex-col items-center border border-white bg-blue-dark p-5` / `text-center text-2xl text-white` / `text-xl text-white` |

- [x] **Step 1: Падаючий тест для ліній перемоги**

Позиції крайніх клітинок — це колишні `nth-child`-правила з `legacy/styles/components/_board.scss`, переписані на індекси 0–8: `nth-child(3n+1)` → `index % 3 === 0`, `nth-child(3n)` → `index % 3 === 2`, `nth-child(-n+3)` → `index < 3`, `nth-child(n+7)` → `index >= 6`.

```ts
// src/components/Cell/winLine.test.ts
import { describe, expect, test } from 'vitest';

import { winLineClassName } from './winLine';

const classes = (line: Parameters<typeof winLineClassName>[0], index: number) =>
    winLineClassName(line, index).split(' ');

describe('winLineClassName', () => {
    test('middle cells keep the base width', () => {
        expect(classes('horizontal', 1)).toContain('w-[calc(100%+6px)]');
        expect(classes('vertical', 4)).toEqual(expect.arrayContaining([ 'rotate-90', 'w-[calc(100%+6px)]' ]));
        expect(classes('rotate_45', 4)).toEqual(expect.arrayContaining([ 'rotate-45', 'w-[144%]' ]));
        expect(classes('rotate_-45', 4)).toEqual(expect.arrayContaining([ '-rotate-45', 'w-[144%]' ]));
    });

    test('horizontal edges stick out by 20px', () => {
        expect(classes('horizontal', 3)).toEqual(expect.arrayContaining([ '-left-5', 'w-[calc(100%+20px)]' ]));
        expect(classes('horizontal', 5)).toEqual(expect.arrayContaining([ '-right-5', 'w-[calc(100%+20px)]' ]));
        expect(classes('horizontal', 3)).not.toContain('w-[calc(100%+6px)]');
    });

    test('vertical edges move with the breakpoint', () => {
        expect(classes('vertical', 1)).toEqual(expect.arrayContaining([ 'top-7', 'md:top-17.5', 'w-[calc(100%+20px)]' ]));
        expect(classes('vertical', 7)).toEqual(expect.arrayContaining([ 'bottom-7', 'md:bottom-17.5' ]));
    });

    test('diagonal corners override the 144% width', () => {
        expect(classes('rotate_45', 0)).toEqual(expect.arrayContaining([
            '-left-7',
            'top-8',
            'w-[calc(100%+50px)]',
            'md:-left-12.5',
            'md:top-18',
            'md:w-[calc(100%+90px)]'
        ]));
        expect(classes('rotate_45', 0)).not.toContain('w-[144%]');
        expect(classes('rotate_45', 8)).toEqual(expect.arrayContaining([ '-right-7', 'bottom-8', 'md:bottom-18.5' ]));
        expect(classes('rotate_-45', 2)).toEqual(expect.arrayContaining([ '-left-5.5', 'top-8', 'md:-left-10' ]));
        expect(classes('rotate_-45', 6)).toEqual(expect.arrayContaining([ '-right-5.5', 'bottom-8', 'md:-right-10' ]));
    });
});
```

Run: `npm run test:once -- --project frontend`
Expected: FAIL з «Failed to resolve import "./winLine"».

- [x] **Step 2: `winLine.ts`**

```ts
// src/components/Cell/winLine.ts
import cn from '@/lib/cn';
import type { Line } from '@convex/rules';

const LINE: Record<Line, string> = {
    'horizontal': '',
    'vertical': 'rotate-90',
    'rotate_45': 'w-[144%] rotate-45',
    'rotate_-45': 'w-[144%] -rotate-45'
};

// Колишні nth-child-правила з _board.scss: крайні клітинки подовжують лінію за межі поля
const edge = (line: Line, index: number): string[] => {
    switch (line) {
        case 'horizontal':
            if (index % 3 === 0) {
                return [ '-left-5 w-[calc(100%+20px)]' ];
            }

            return index % 3 === 2 ? [ '-right-5 w-[calc(100%+20px)]' ] : [];
        case 'vertical':
            if (index < 3) {
                return [ 'top-7 w-[calc(100%+20px)]', 'md:top-17.5' ];
            }

            return index >= 6 ? [ 'bottom-7 w-[calc(100%+20px)]', 'md:bottom-17.5' ] : [];
        case 'rotate_45':
            if (index === 0) {
                return [ '-left-7 top-8 w-[calc(100%+50px)]', 'md:-left-12.5 md:top-18 md:w-[calc(100%+90px)]' ];
            }

            return index === 8
                ? [ '-right-7 bottom-8 w-[calc(100%+50px)]', 'md:-right-12.5 md:bottom-18.5 md:w-[calc(100%+90px)]' ]
                : [];
        case 'rotate_-45':
            if (index === 2) {
                return [ '-left-5.5 top-8 w-[calc(100%+50px)]', 'md:-left-10 md:top-18 md:w-[calc(100%+90px)]' ];
            }

            return index === 6
                ? [ '-right-5.5 bottom-8 w-[calc(100%+50px)]', 'md:-right-10 md:bottom-18.5 md:w-[calc(100%+90px)]' ]
                : [];
    }
};

export const winLineClassName = (line: Line, index: number): string => cn([
    'absolute z-10 h-2.5 w-[calc(100%+6px)] bg-blue-700',
    LINE[ line ],
    ...edge(line, index)
]);
```

Run: `npm run lint:fix && npm run test:once -- --project frontend`
Expected: PASS.

- [x] **Step 3: Типи, анімації, дрібні компоненти**

```ts
// src/types/game.ts
import type { FunctionReturnType } from 'convex/server';

import type { api } from '@convex/_generated/api';

export type GameView = NonNullable<FunctionReturnType<typeof api.games.get>>;
export type PlayerView = NonNullable<GameView['circle']>;
```

```ts
// src/lib/motion.ts
// Крива `transition` із Tailwind — та сама, що в старих CSS-переходах
export const TAILWIND_EASE = [ 0.4, 0, 0.2, 1 ] as const;

export const FADE = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
};
```

```tsx
// src/components/Fade/Fade.tsx
// Заміна TransitionWrapper (react-transition-group не працює з React 19 без nodeRef)
import { AnimatePresence, motion } from 'motion/react';
import type { FC, ReactNode } from 'react';

import { FADE, TAILWIND_EASE } from '@/lib/motion';

type FadeProps = {
    show: boolean,
    className?: string,
    children?: ReactNode
};

const Fade: FC<FadeProps> = ({ show, className, children }) => (
    <AnimatePresence initial={ false }>
        { show && (
            <motion.div
                { ...FADE }
                transition={ { duration: 0.15, ease: TAILWIND_EASE } }
                className={ className }
            >
                { children }
            </motion.div>
        ) }
    </AnimatePresence>
);

export default Fade;
```

```tsx
// src/components/FadeSwitch/FadeSwitch.tsx
// Заміна SwitchTransitionWrapper: старий вміст згасає, новий з'являється (out-in), 75 мс
import { AnimatePresence, motion } from 'motion/react';
import type { FC, ReactNode } from 'react';

import { FADE, TAILWIND_EASE } from '@/lib/motion';

type FadeSwitchProps = {
    switchKey: string,
    children?: ReactNode
};

const FadeSwitch: FC<FadeSwitchProps> = ({ switchKey, children }) => (
    <AnimatePresence
        initial={ false }
        mode="wait"
    >
        <motion.div
            key={ switchKey }
            { ...FADE }
            transition={ { duration: 0.075, ease: TAILWIND_EASE } }
        >
            { children }
        </motion.div>
    </AnimatePresence>
);

export default FadeSwitch;
```

```tsx
// src/components/MarkIcon/MarkIcon.tsx
import type { FC } from 'react';

import cn from '@/lib/cn';
import type { Mark } from '@convex/rules';

const MarkIcon: FC<{ mark: Mark }> = ({ mark }) => {
    if (mark === 'circle') {
        return (
            <div
                className={
                    cn([
                        'h-8 w-8 rounded-full border-4 border-green',
                        'md:h-11 md:w-11'
                    ])
                }
            />
        );
    }

    return (
        <div
            className={
                cn([
                    'relative flex h-8 w-8 items-center justify-center',
                    'md:h-11 md:w-11'
                ])
            }
        >
            <div
                className={
                    cn([
                        'absolute h-1 w-10 rotate-45 bg-red',
                        'md:w-14'
                    ])
                }
            />
            <div
                className={
                    cn([
                        'absolute h-1 w-10 -rotate-45 bg-red',
                        'md:w-14'
                    ])
                }
            />
        </div>
    );
};

export default MarkIcon;
```

```tsx
// src/components/Player/Player.tsx
import type { FC } from 'react';

import notAvatar from '@/assets/not-avatar.jpg';
import MarkIcon from '@/components/MarkIcon';
import cn from '@/lib/cn';
import type { PlayerView } from '@/types/game';
import type { Mark } from '@convex/rules';

type PlayerProps = {
    mark: Mark,
    player: PlayerView | null
};

const Player: FC<PlayerProps> = ({ mark, player }) => (
    <div
        className={
            cn([
                'flex items-center gap-x-5',
                'md:gap-x-8'
            ])
        }
    >
        <MarkIcon mark={ mark } />
        <div
            className={
                cn([
                    'ml-2.5 h-7 w-7 overflow-hidden rounded-full border border-white',
                    'md:ml-5 md:h-10 md:w-10'
                ])
            }
        >
            <img
                src={ player?.avatar || notAvatar }
                alt="Player"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
            />
        </div>
        <p
            className={
                cn([
                    'mr-auto max-w-37.5 truncate text-2xl font-semibold',
                    'md:max-w-105 md:text-4xl md:leading-tight'
                ])
            }
        >
            { player?.name || 'Player' }
        </p>
        <p
            className={
                cn([
                    'w-9 text-right text-3xl leading-none font-semibold',
                    'md:w-14 md:text-5xl'
                ])
            }
        >
            { player?.score ?? 0 }
        </p>
    </div>
);

export default Player;
```

`referrerPolicy="no-referrer"` потрібен для аватарок з `googleusercontent.com`: без нього вони іноді віддають 403.

```tsx
// src/components/Statistics/Statistics.tsx
import type { FC } from 'react';

import FadeSwitch from '@/components/FadeSwitch';
import MarkIcon from '@/components/MarkIcon';
import cn from '@/lib/cn';
import type { GameView } from '@/types/game';
import type { Mark } from '@convex/rules';

type StatisticsProps = {
    turn: Mark,
    result: GameView['result']
};

const LABEL = { win: 'Winner', draw: 'Draw' } as const;

const shownMark = (turn: Mark, result: GameView['result']): Mark | null => {
    if (!result) {
        return turn;
    }

    return result.kind === 'win' ? result.mark : null;
};

const Statistics: FC<StatisticsProps> = ({ turn, result }) => {
    const label = result ? LABEL[ result.kind ] : 'Turn';
    const mark = shownMark(turn, result);

    return (
        <div className="flex items-center justify-end gap-x-5">
            <FadeSwitch switchKey={ label }>
                <p
                    className={
                        cn([
                            'flex items-center gap-x-5 text-2xl font-semibold',
                            'md:text-4xl'
                        ])
                    }
                >
                    { label }
                    { mark && <span>&#10142;</span> }
                </p>
            </FadeSwitch>
            <FadeSwitch switchKey={ mark ?? 'none' }>
                { mark && <MarkIcon mark={ mark } /> }
            </FadeSwitch>
        </div>
    );
};

export default Statistics;
```

```tsx
// src/components/Waiting/Waiting.tsx
import type { FC } from 'react';
import { ProgressBar } from 'react-loader-spinner';

import Overlay from '@/components/Overlay';

const Waiting: FC<{ code: string }> = ({ code }) => (
    <Overlay className="top-15 bg-transparent">
        <div className="flex w-[85vw] max-w-100 flex-col items-center border border-white bg-blue-dark p-5">
            <p className="text-center text-2xl text-white">Waiting the second player</p>
            <ProgressBar
                height="100"
                width="100"
                borderColor="#bfdbfe"
                barColor="#bfdbfe"
                ariaLabel="progress-bar-loading"
            />
            <p className="text-xl text-white">Want to add a second player? Copy and send the game ID:</p>
            <p className="text-xl text-white">{ code }</p>
        </div>
    </Overlay>
);

export default Waiting;
```

```tsx
// src/components/Cell/Cell.tsx
import type { FC } from 'react';

import Fade from '@/components/Fade';
import cn from '@/lib/cn';
import type { Cell as CellValue, WinLine } from '@convex/rules';

import { winLineClassName } from './winLine';

type CellProps = {
    index: number,
    value: CellValue,
    winLine: WinLine | null,
    onSelect: (index: number) => void
};

const Cell: FC<CellProps> = ({ index, value, winLine, onSelect }) => {
    const line = value && winLine?.cells.includes(index) ? winLine.line : null;

    return (
        <div
            className={
                cn('relative flex cursor-pointer items-center justify-center bg-blue-50 transition hover:bg-blue-200', {
                    'pointer-events-none': value !== ''
                })
            }
            onClick={
                () => {
                    onSelect(index);
                }
            }
        >
            <Fade
                show={ value === 'circle' }
                className="h-3/4 w-3/4 rounded-full border-4 border-green"
            />
            <Fade
                show={ value === 'cross' }
                className="relative -top-0.5 w-full"
            >
                <div className="absolute h-1 w-full rotate-45 bg-red" />
                <div className="absolute h-1 w-full -rotate-45 bg-red" />
            </Fade>
            <Fade
                show={ line !== null }
                className={ line ? winLineClassName(line, index) : '' }
            />
        </div>
    );
};

export default Cell;
```

Поки лінія згасає, `AnimatePresence` тримає останній відрендерений елемент з його старим `className`, тому лінія не стрибає.

- [x] **Step 4: GamePage**

```tsx
// src/pages/GamePage/GamePage.tsx
import { useMutation, useQuery } from 'convex/react';
import { type FC, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import Button from '@/components/Button';
import Cell from '@/components/Cell';
import Player from '@/components/Player';
import Spinner from '@/components/Spinner';
import Statistics from '@/components/Statistics';
import Waiting from '@/components/Waiting';
import cn from '@/lib/cn';
import errorMessage from '@/lib/errorMessage';
import { api } from '@convex/_generated/api';

const onError = (error: unknown) => {
    toast.error(errorMessage(error));
};

const GamePage: FC = () => {
    const { gameId = '' } = useParams();
    const [ searchParams ] = useSearchParams();
    const navigate = useNavigate();
    const game = useQuery(api.games.get, { code: gameId });
    const enter = useMutation(api.games.enter);
    const makeMove = useMutation(api.games.makeMove);
    const clearBoard = useMutation(api.games.clearBoard);
    const newSession = useMutation(api.games.newSession);
    const isMoving = useRef(false);

    const markParam = searchParams.get('mark');
    const mark = markParam === 'circle' || markParam === 'cross' ? markParam : undefined;

    // Вхід ідемпотентний: повторний виклик (StrictMode, друга вкладка, повернення за посиланням) дає 'already'
    useEffect(
        () => {
            enter({ code: gameId, mark })
                .then(status => {
                    if (status === 'created') {
                        toast.success('New game');
                        navigate(`/game/${ encodeURIComponent(gameId) }`, { replace: true });
                    }

                    if (status === 'joined') {
                        toast.success('Join game');
                    }
                })
                .catch((error: unknown) => {
                    onError(error);
                    navigate('/');
                });
        },
        [ enter, gameId, mark, navigate ]
    );

    // Review Focus 5: подвійний клік не шле другий хід, поки перший не повернувся
    const onSelect = (cell: number) => {
        if (!game || !game.circle || !game.cross || game.result || game.turn !== game.me || isMoving.current) {
            return;
        }

        isMoving.current = true;
        makeMove({ code: gameId, cell })
            .catch(onError)
            .finally(() => {
                isMoving.current = false;
            });
    };

    if (!game) {
        return <Spinner />;
    }

    const winLine = game.result?.kind === 'win' ? game.result : null;

    return (
        <>
            { (!game.circle || !game.cross) && <Waiting code={ game.code } /> }
            <div
                className={
                    cn([
                        'w-full',
                        'md:w-175'
                    ])
                }
            >
                <div
                    className={
                        cn([
                            'mb-2.5 flex flex-col gap-y-5 border-b-2 pb-2.5',
                            'md:mb-5 md:pb-5'
                        ])
                    }
                >
                    <Player
                        mark="circle"
                        player={ game.circle }
                    />
                    <Player
                        mark="cross"
                        player={ game.cross }
                    />
                </div>
                <Statistics
                    turn={ game.turn }
                    result={ game.result }
                />
                <div
                    className={
                        cn([
                            'mx-auto my-8 grid h-60 w-60 grid-cols-3 grid-rows-3 gap-0.5 bg-black',
                            'md:h-125 md:w-125'
                        ])
                    }
                >
                    { game.board.map((value, index) => (
                        <Cell
                            key={ index }
                            index={ index }
                            value={ value }
                            winLine={ winLine }
                            onSelect={ onSelect }
                        />
                    )) }
                </div>
                <div className="flex justify-evenly">
                    <Button
                        className="basis-1/3"
                        onClick={
                            () => {
                                newSession({ code: gameId }).catch(onError);
                            }
                        }
                    >
                        New
                    </Button>
                    <Button
                        className="basis-1/3"
                        onClick={
                            () => {
                                clearBoard({ code: gameId }).catch(onError);
                            }
                        }
                    >
                        Clear
                    </Button>
                </div>
            </div>
        </>
    );
};

export default GamePage;
```

- [x] **Step 5: Маршрут у `App.tsx`**

Додати імпорти `GamePage` з `@/pages/GamePage` і `PrivateRoute` з `@/routes/PrivateRoute`, а перед маршрутом `path="*"` вставити:

```tsx
<Route
    path="/game/:gameId"
    element={ <PrivateRoute><GamePage /></PrivateRoute> }
/>
```

- [x] **Step 6: Автоматичні перевірки**

Run: `npm run lint:fix && npm run lint && npm run typecheck && npm run test:once`
Expected: зелене.

- [x] **Step 7: Ручний QA (два браузери: звичайне вікно й інкогніто, два різні Google-акаунти)**

1. A: New game → Circle → Generate → Start. Очікується toast «New game», оверлей «Waiting the second player» з ID, а адреса вже без `?mark`.
2. B (не залогінений) відкриває `http://localhost:5173/game/<ID>`, логіниться через Google і повертається в ту саму гру з toast «Join game». Оверлей у A зникає. *(Review Focus 4)*
3. A ходить першим. Клік B не в свою чергу нічого не робить і toast не показує. Подвійний клік A по клітинці дає один хід без toast «Not your turn». *(Review Focus 5)*
4. Виграшні лінії: пройти всі 8 (3 рядки, 3 стовпці, 2 діагоналі) на ширині 1440 і 360 px. Синя лінія виходить за поле так само, як у старій версії. Через 1.5 с поле очищується, а рахунок переможця +1.
5. Нічия: напис «Draw» без стрілки й без знака; через 1.5 с поле очищується, рахунки без змін.
6. CLEAR очищує поле зі збереженням рахунку; NEW скидає і рахунок.
7. B: MENU → у меню ID і ім'я → HOME → OK. A бачить «Waiting the second player», рахунки 0. *(Review Focus 3)*
8. B заходить знову за посиланням і займає вільний слот. Третій акаунт C отримує toast «Maximum number of players» і повертається на `/`.
9. A відкриває ту саму гру в другій вкладці: обидві вкладки показують однаковий стан, і другий слот не займається. *(Review Focus 1)*
10. `/game/abc%20def` дає toast «Invalid game ID» і повернення на `/`.

- [x] **Step 8: Коміт**

```bash
git add src
git commit -m "feat: port game page with server-driven state and animations"
```

---

### Task 10: Прибирання, деплой, фінальна ревізія

**Files:**
- Delete: `legacy/`
- Modify: `netlify.toml`, `README.md`

- [ ] **Step 1: Прибрати старий код**

```bash
git rm -r legacy
```

Прибрати `'legacy/**'` з `globalIgnores` в `eslint.config.mjs`.

- [ ] **Step 2: `netlify.toml`**

```toml
[build]
  command = "npx convex deploy --cmd 'npm run build'"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- [ ] **Step 3: 👤 Продакшн**

1. Дашборд Convex → prod-деплоймент → Settings → General → Generate Production Deploy Key (з правом `deployment:deploy`).
2. Netlify → Site configuration → Environment variables:
   - додати `CONVEX_DEPLOY_KEY` з цим ключем;
   - видалити старі `REACT_APP_*`.
3. Налаштувати Convex Auth на prod-деплойменті. На запит `SITE_URL` відповісти `https://<site>.netlify.app`. Потім задати ключі Google:

```bash
npx @convex-dev/auth --prod
npx convex env set --prod AUTH_GOOGLE_ID <client id>
npx convex env set --prod AUTH_GOOGLE_SECRET <client secret>
```

4. У тому самому Google OAuth client додати:
   - origin `https://<site>.netlify.app`;
   - redirect URI `https://<prod-deployment>.convex.site/api/auth/callback/google`.

- [ ] **Step 4: README**

```markdown
# tic-tac-toe

Хрестики-нолики на двох гравців онлайн.

Стек: Vite + React 19 + TypeScript + Tailwind CSS 4 + React Router 8. Бекенд — Convex (база, серверні функції, Google-вхід через Convex Auth).

## Запуск

1. `npm install`
2. `npx convex dev` — логін у Convex, створює `.env.local` з `VITE_CONVEX_URL`; лишити працювати
3. Google OAuth і змінні `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — див. https://labs.convex.dev/auth/config/oauth/google
4. `npm run dev` і відкрити http://localhost:5173

## Скрипти

- `npm run dev` / `npm run dev:convex` — фронт / бекенд у режимі розробки
- `npm run test` — Vitest (функції Convex через convex-test + фронтові юніт-тести)
- `npm run lint`, `npm run lint:fix`, `npm run typecheck`, `npm run build`

Деплой — Netlify, команда збірки `npx convex deploy --cmd 'npm run build'`.
```

- [ ] **Step 5: Фінальна ревізія формату й тести**

```bash
node .claude/skills/tailwind-format/scripts/scan_classnames.mjs src
node .claude/skills/tailwind-format/scripts/scan_cn_order.mjs src
node .claude/skills/tailwind-format/scripts/scan_values.mjs src
node .claude/skills/tailwind-format/scripts/scan_arrows.mjs src
npm run lint && npm run typecheck && npm run test:once && npm run build
```

Що має вийти:
- `scan_classnames` і `scan_cn_order` нічого не друкують.
- `scan_values` друкує тільки `w-[calc(…)]`, `w-[144%]`, `w-[85vw]`, `max-w-[calc(100vw-40px)]`: у теми таких значень справді немає.
- Кожного кандидата від `scan_arrows` звірити з сигнатурою; void-стрілок без блокового тіла лишитись не повинно.
- Lint, typecheck, тести й build зелені.

- [ ] **Step 6: Коміт, пуш, деплой**

```bash
git add -A
git commit -m "chore: remove legacy code and deploy via Convex on Netlify"
git push -u origin migrate/vite-convex
```

Відкрити PR у `main`. Після мержу Netlify збере й задеплоїть фронт і функції Convex. Повторити кроки QA 1–8 із задачі 9 на `https://<site>.netlify.app`.

Firebase-проєкт `tic-tac-toe-4bcfd` після успішного деплою можна вимкнути, але це рішення власника, і план його не чіпає.
