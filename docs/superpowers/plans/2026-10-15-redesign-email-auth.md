# Редизайн tic-tac-toe і вхід поштою — план реалізації

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** перенести в код новий дизайн з канвасу (темна тема, shadcn/ui, десктоп і телефон) і додати реєстрацію та вхід поштою з паролем, з перевіркою, що пошта ще не зареєстрована.

**Architecture:**
- **Бекенд.** Логіка гри на Convex не змінюється. Convex Auth отримує власний провайдер `convex/emailPassword.ts` на `ConvexCredentials` з `id: 'password'` і хешуванням Scrypt, як у штатного `Password`. Під час реєстрації він перевіряє, чи пошта вже зайнята, і кидає `ConvexError` з готовим текстом: такі помилки, на відміну від звичайних `Error`, видно й на prod.
- **Фронт.** Компоненти shadcn/ui (Radix + Tailwind 4) з токенами теми в `src/index.css`. Сторінки входу живуть окремо від застосунку з шапкою; для `/` і `/game/:id` є спільний layout.
- **Десктоп і телефон.** На ширині від `md` (48rem) показуються дропдаун і модальні діалоги, на телефоні — бургер-меню (Sheet) і нижня панель (Drawer).

**Tech Stack:** Vite 8, React 19, TypeScript 6, Tailwind CSS 4.3, React Router 8, Convex 1.46 + `@convex-dev/auth` 0.0.96 (`ConvexCredentials`, `createAccount`, `retrieveAccount`), `lucia` 3 (Scrypt), shadcn/ui (Radix), `lucide-react`, `sonner`, `vaul` (Drawer), `react-hook-form` + `zod` 4 + `@hookform/resolvers`, `@fontsource-variable/{geist,geist-mono,bricolage-grotesque}`, `motion`, Vitest 5 + Testing Library + `@testing-library/user-event`, `convex-test`, `@playwright/test` (e2e), Playwright MCP (перевірки в браузері під час роботи).

**Виконання:** Native (обрано власником 2026-10-15): усі задачі по черзі в одній сесії, наприкінці одна рецензія всієї гілки. Стан на 2026-10-16 — задачі 1–10 виконані на гілці `redesign`; лишились кроки власника в задачі 10 (крок 4, пункт 3 — Google і Web Share; крок 6 — prod після деплою). Галочки `- [x]` у кроках показують, що вже зроблено.

**Spec:** дизайн — канвас https://claude.ai/artifact/PDTUiw8QMxFx1aLJRnp4US, його копія лежить у репозиторії в `docs/design/` (екрани `*.dc.html`; точні кольори, відступи й тексти беруться звідти). Рішення з розмови зведені в розділ «Рішення».

**Зміни від 2026-10-16:**
- Підтвердження пошти кодом і скидання пароля відкладені (розділ «Пізніше» в кінці). Задача 6 лишилась заглушкою, щоб номери не зсувались. Перша версія плану з повними кроками для коду й скидання — у коміті `5a16c71`.
- Ручні перевірки замінені: e2e-тестами на Playwright (нова задача 9, прибирання стало задачею 10) і перевірками в браузері, які Claude робить сам через Playwright MCP. Тестові користувачі прибираються командою, а не в дашборді.

## Рішення

- Дизайн — канвас вище. Він розбитий на ряди: «Auth · desktop», «Auth · phone», «Play · desktop», «Play · phone» і аркуш «Components (shadcn/ui)». Екрани «Verify email» і «Reset password» поки не реалізуються.
- Бібліотека компонентів — shadcn/ui на Radix. Файли компонентів генеруються в `src/components/ui/` і далі вважаються кодом проєкту, а не залежністю.
- Тема тільки темна, світлої немає.
- Вхід:
  - Google, як зараз;
  - пошта з паролем: реєстрація одразу входить в акаунт, без коду на пошту;
  - мінімальна довжина пароля — 8 символів, пошта зберігається обрізаною й у нижньому регістрі.
- Перевірка зайнятої пошти при реєстрації — на сервері, всередині реєстрації, а не окремим публічним запитом (щоб не можна було масово перебирати адреси):
  - пошта вже має акаунт з паролем — «An account with this email already exists. Sign in instead»;
  - на пошту вже входили через Google — «This email is linked to Google. Continue with Google instead». Без підтвердженої пошти Convex Auth не з'єднує акаунти Google і пошти, тож дубль не створюємо.
- Наслідки відсутності підтвердження, з якими власник погодився:
  - можна зареєструватися на чужу адресу;
  - забутий пароль не відновлюється самостійно, лише видаленням акаунта в дашборді Convex.
- Посилання «Forgot password?» на сторінці входу поки немає.
- Лобі (`/`) тепер тільки для тих, хто увійшов: привітання звертається на ім'я. Анонім потрапляє на `/login`, а після входу повертається туди, звідки прийшов.
- Меню:
  - **Десктоп:** дропдаун з аватаром та ім'ям. У грі в ньому є ID гри (клік копіює), «Copy invite link», «Back to lobby» і «Sign out»; у лобі — лише «Sign out».
  - **Телефон:** бургер-меню з тим самим вмістом, лінк поширюється через «Share invite link». Якщо браузер не вміє Web Share, лінк копіюється.
- «Back to lobby», «Sign out» і клік по логотипу в грі просять підтвердження в діалозі «Leave the game?» / «Sign out?». У лобі «Sign out» виходить одразу.
- Очікування суперника: на десктопі модальний діалог, на телефоні нижня панель. Закрити їх можна лише через «Cancel and leave», без підтвердження, бо гравець у грі сам.
- Лінія перемоги більше не малюється поверх поля. Виграшні клітинки підсвічуються кольором переможця.
- Тексти інтерфейсу англійською, дослівно з канвасу.

## Global Constraints

- Попередні обмеження з `docs/superpowers/plans/2026-10-12-vite-convex-migration.md` лишаються в силі:
  - Node `>=22.12`;
  - TypeScript `~6.0.3`;
  - ESLint `^9`;
  - `@auth/core@^0.41.3`;
  - роутер імпортується з `react-router`;
  - Tailwind 4 без `tailwind.config.js`.
- **Формат класів і стрілок** — за `~/.claude/CLAUDE.md` і скілом `.claude/skills/tailwind-format/`:
  - класи групуються по брейкпоінтах, `cn([…])` — один рядок на групу;
  - стрілка, яка нічого не повертає, має блокове тіло.
- **Те саме стосується файлів shadcn/ui** після генерації (у глобальних правилах сказано «і при переносі чужого»): після кожного `npx shadcn add` запусти `npm run lint:fix` і сканери скіла.
- **Токени замість hex у класах.** Кольори з канвасу в JSX не пишуться, лише через токени `@theme` (таблиця в задачі 1).
- **Числа з канвасу округлюються до шкали Tailwind** (крок 4px, `text-*`). Розбіжність до 4px — норма. Довільні значення в дужках допустимі тільки там, де шкали немає (шаблони grid).
- **Поля вводу** мають шрифт 16px (`text-base`), щоб iOS не збільшував сторінку при фокусі. На канвасі там 15px.
- **Розміри для дотику:** інтерактивні елементи щонайменше 44×44px (`size-11` / `h-11`).
- Перемикання десктоп/телефон — `md` (48rem): у класах і в хуку `useMediaQuery(DESKTOP)`.
- Правила пароля й пошти живуть у `convex/authRules.ts` (`MIN_PASSWORD_LENGTH = 8`, `normalizeEmail`, `validatePassword`, тексти помилок). Фронт імпортує їх через `@convex/authRules`.
- **Convex приховує на prod повідомлення звичайних `Error`.** Усе, що має побачити людина, сервер кидає як `ConvexError('текст')`. Клієнт показує `error.data`, а для будь-якої іншої помилки — запасний текст сценарію.
- **Перевірки в браузері робить Claude** через Playwright MCP (`mcp__plugin_playwright_playwright__*`) на `npm run dev`, з `npx convex dev`, запущеним у фоні:
  - знімки на 1280px і 390px звіряються з `docs/design/<Ім'я>.dc.html`;
  - власника кличемо лише для входу через Google і системного меню «Поділитися».
- **Тестові користувачі** — лише адреси `e2e-…@e2e.test` (в e2e-тестах і в перевірках Claude). Прибирання: `npx convex run testing:deleteE2eUsers`. Чужі чи справжні адреси у форми не вводяться.
- Логіни в Convex і Netlify і будь-які секрети робить власник (👤). Claude лише каже, що зробити. Пушить на GitHub теж власник.
- Кожен коміт закінчується рядком `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Після кожної задачі: `npm run lint:fix && npm run typecheck && npm run test:once` — усе зелене.

## Review Focus

1. **Реєстрація на пошту, яка вже має акаунт з паролем.** Людина бачить «An account with this email already exists. Sign in instead» і на prod теж, а не безлике «Server Error». Тести — задачі 2, 5 і 9; перевірка на prod — задача 10.
2. **Реєстрація на пошту, на яку вже входили через Google.** Друга людина не створюється, звучить порада увійти через Google. Тести — задачі 2 і 5.
3. **Пряме посилання на гру → реєстрація.** Після реєстрації людина повертається на `/game/:id`, тобто `from` переживає перехід `/login → /signup`. Тести — задачі 3, 5 і 9.
4. **Скасоване меню «Поділитися» на телефоні** (`AbortError`): без toast-а про помилку й без копіювання. На десктопі без `navigator.share` лінк копіюється. Тест — задача 3.
5. **Клік по логотипу посеред гри.** Має з'явитися підтвердження, а не тихий перехід у лобі, після якого місце в грі лишається зайнятим. Тест — задача 3.

---

## Відповідність канвасу й коду

| Артборд | Де в коді |
|---|---|
| `Main`, `MobileSignIn` | `src/pages/SignInPage` (`/login`), без лінка «Forgot password?» |
| `SignUp`, `MobileSignUp` | `src/pages/SignUpPage` (`/signup`) |
| `VerifyEmail`, `MobileVerifyEmail`, `ResetPassword`, `MobileResetPassword` | поки ніде — див. «Пізніше» |
| `Lobby`, `LobbyJoin`, `MobileLobby`, `MobileLobbyJoin` | `src/pages/HomePage` (`/`, вкладки New / Join) |
| `Waiting`, `MobileWaiting` | `src/components/WaitingForOpponent` |
| `Game`, `GameOpponent`, `MobilePlay`, `MobileOpponent`, `MobileGame` | `src/pages/GamePage` + `Board`, `PlayerCard`, `TurnStatus` |
| дропдаун на `Lobby` / `GameOpponent` | `src/components/AccountMenu` |
| `MobileMenu` | `src/components/MobileMenu` |
| `Components` | `src/components/ui/*` + токени в `src/index.css` |

Щоб звірити екран, читай `docs/design/<Ім'я>.dc.html` (копія канвасу, див. `docs/design/README.md`) або відкрий сам канвас.

## Структура файлів після редизайну

```
convex/
├─ auth.ts                    providers: [ Google, EmailPassword ]
├─ authRules.ts / .test.ts    MIN_PASSWORD_LENGTH, normalizeEmail, validatePassword, EmailStatus, takenEmailMessage
├─ emailPassword.ts           ConvexCredentials id 'password': signUp з перевіркою пошти, signIn
├─ users.ts / users.test.ts   me → { name, email, avatar }; internal emailStatus
├─ testing.ts / .test.ts      internal deleteE2eUsers — прибирання користувачів @e2e.test
└─ test.setup.ts              asUser додає email
src/
├─ index.css               токени теми, шрифти, base
├─ App.tsx                 маршрути: auth окремо, AppLayout для / і /game/:id
├─ hooks/                  useMediaQuery, useFrom, useLeaveGame
├─ lib/                    cn (+ named), invite, authError, gameStatus, passwordStrength, initials
├─ test/                   setup.ts (поліфіли jsdom), viewport.ts (mockViewport)
├─ components/
│  ├─ ui/                  shadcn: button input label sonner dropdown-menu sheet alert-dialog avatar dialog drawer tabs
│  ├─ Logo  UserAvatar  CopyButton  FieldError  PasswordInput  OrDivider  GoogleButton  HeroBoard
│  ├─ AuthSplitLayout  AppLayout  AppHeader  AccountMenu  MobileMenu  LeaveGameDialog
│  ├─ MarkIcon  MarkPicker  Board  BoardCell  PlayerCard  TurnStatus  WaitingForOpponent
│  └─ Fade  FadeSwitch  Spinner     (лишаються; Spinner переписаний)
└─ pages/  SignInPage  SignUpPage  HomePage  GamePage
e2e/                          Playwright: helpers.ts, auth.spec.ts, game.spec.ts, teardown.ts
playwright.config.ts          проєкти desktop (1280px) і phone (390px)
```

Видаляються:
- **Компоненти:** `NavBar`, `UserMenu`, `Modal`, `Overlay`, `Container`, `RadioInput`, `Button` (старий), `Player`, `Statistics`, `Waiting`, `Cell` (з `winLine.ts`).
- **Інше:** `hooks/useEscapeKey.ts`, `pages/LoginPage`, `assets/bg.jpg`, `assets/not-avatar.jpg`.
- **Залежності:** `react-hot-toast`, `react-loader-spinner`.

Кожен компонент — тека `Name/Name.tsx` + `Name/index.ts` (`export { default } from './Name';`), як зараз у проєкті. Крок «створи `index.ts`» далі окремо не повторюється.

---

### Task 1: Фундамент — токени, шрифти, shadcn/ui, sonner, тестове середовище

**Files:**
- Create: `components.json`, `src/test/setup.ts`, `src/test/viewport.ts`, `src/components/ui/{button,input,label,sonner}.tsx`
- Modify: `package.json`, `src/index.css`, `src/lib/cn.ts`, `vitest.config.ts`, `eslint.config.mjs`, `index.html`, `src/App.tsx`, усі файли з `react-hot-toast` (`grep -rl "react-hot-toast" src`)
- Test: наявні тести (переведені на sonner)

**Interfaces:**
- Produces:
  - `cn` (default + named) з `@/lib/cn`;
  - `Button`, `buttonVariants` з `@/components/ui/button`, варіанти `default | secondary | ghost | destructive | link`, розміри `default | lg | icon | icon-sm`;
  - `Input`, `Label`, `Toaster` з `@/components/ui/*`;
  - `toast` з `sonner`;
  - `mockViewport(desktop: boolean): void` з `@/test/viewport`;
  - токени кольорів: `background foreground card popover primary secondary muted accent border input ring destructive danger danger-bg danger-border field line label subtle placeholder link link-hover circle cross cross-soft`;
  - шрифти `font-sans`, `font-mono`, `font-display`.

- [x] **Step 1: Встанови залежності**

```bash
npm i lucide-react sonner @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/bricolage-grotesque
npm i -D @testing-library/user-event
```

- [x] **Step 2: Додай іменований `cn`**

`src/lib/cn.ts`:

```ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Іменований експорт потрібен файлам shadcn/ui: вони імпортують `{ cn }` з аліасу utils
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export default cn;
```

- [x] **Step 3: Створи `components.json`**

```json
{
    "$schema": "https://ui.shadcn.com/schema.json",
    "style": "new-york",
    "rsc": false,
    "tsx": true,
    "tailwind": {
        "config": "",
        "css": "src/index.css",
        "baseColor": "neutral",
        "cssVariables": true,
        "prefix": ""
    },
    "iconLibrary": "lucide",
    "aliases": {
        "components": "@/components",
        "ui": "@/components/ui",
        "utils": "@/lib/cn",
        "lib": "@/lib",
        "hooks": "@/hooks"
    }
}
```

- [x] **Step 4: Перепиши токени в `src/index.css`**

Старі кольори (`blue-50`, `blue-200`, `blue-700`, `blue-dark`, `stone-300`, `red`, `green`) поки лишаються в блоці legacy: на них ще тримаються старі `HomePage` і `GamePage` до задач 7–8. Скид `--color-*: initial` і власні брейкпоінти прибираються: shadcn використовує `sm:`, `black`, `white` зі стандартної палітри.

```css
/* Класи шукаємо лише в src: інакше Tailwind підхоплює приклади з docs/ і .claude/ */
@import 'tailwindcss' source('.');
@import 'tw-animate-css';
@import '@fontsource-variable/geist';
@import '@fontsource-variable/geist-mono';
@import '@fontsource-variable/bricolage-grotesque';

/* Tailwind 4 за замовчуванням вмикає hover лише на пристроях із курсором; у старій версії hover був скрізь */
@custom-variant hover (&:hover);

:root {
    --radius: 0.625rem;

    /* Палітра канвасу «Tic-Tac-Toe redesign», аркуш Components */
    --background: #0d0f1f;
    --foreground: #edefff;
    --card: #151830;
    --card-foreground: #edefff;
    --popover: #1d2142;
    --popover-foreground: #edefff;
    --primary: #edefff;
    --primary-foreground: #0d0f1f;
    --secondary: #1d2142;
    --secondary-foreground: #edefff;
    --muted: #121530;
    --muted-foreground: #a3a8cf;
    --accent: #262b55;
    --accent-foreground: #edefff;
    --destructive: #ff7a7a;
    --border: #2b3060;
    --input: #2b3060;
    --ring: #6c8cff;

    --danger: #ff9b9b;
    --danger-bg: #2a1520;
    --danger-border: #5a2a36;
    --field: #10132a;
    --line: #22264d;
    --label: #d6d9f5;
    --subtle: #8086b3;
    --placeholder: #6b7099;
    --link: #a9bcff;
    --link-hover: #d3ddff;
    --circle: #6c8cff;
    --cross: #ffa24c;
    --cross-soft: #3a2e2a;
}

@theme inline {
    --font-sans: 'Geist Variable', ui-sans-serif, system-ui, sans-serif;
    --font-mono: 'Geist Mono Variable', ui-monospace, monospace;
    --font-display: 'Bricolage Grotesque Variable', 'Geist Variable', sans-serif;

    --radius-sm: calc(var(--radius) - 4px);
    --radius-md: calc(var(--radius) - 2px);
    --radius-lg: var(--radius);
    --radius-xl: calc(var(--radius) + 4px);

    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --color-card: var(--card);
    --color-card-foreground: var(--card-foreground);
    --color-popover: var(--popover);
    --color-popover-foreground: var(--popover-foreground);
    --color-primary: var(--primary);
    --color-primary-foreground: var(--primary-foreground);
    --color-secondary: var(--secondary);
    --color-secondary-foreground: var(--secondary-foreground);
    --color-muted: var(--muted);
    --color-muted-foreground: var(--muted-foreground);
    --color-accent: var(--accent);
    --color-accent-foreground: var(--accent-foreground);
    --color-destructive: var(--destructive);
    --color-border: var(--border);
    --color-input: var(--input);
    --color-ring: var(--ring);
    --color-danger: var(--danger);
    --color-danger-bg: var(--danger-bg);
    --color-danger-border: var(--danger-border);
    --color-field: var(--field);
    --color-line: var(--line);
    --color-label: var(--label);
    --color-subtle: var(--subtle);
    --color-placeholder: var(--placeholder);
    --color-link: var(--link);
    --color-link-hover: var(--link-hover);
    --color-circle: var(--circle);
    --color-cross: var(--cross);
    --color-cross-soft: var(--cross-soft);
}

/* Legacy: тримає старі HomePage/GamePage до задач 7–8, видаляється в задачі 10 */
@theme {
    --color-blue-dark: #1b1c3a;
    --color-red: #ff0000;
    --color-green: #008000;
}

@layer base {
    * {
        @apply border-border outline-ring/50;
    }

    /* Tailwind 4 прибрав cursor: pointer у кнопок, у Tailwind 3 він був */
    button:not(:disabled),
    [role='button']:not(:disabled) {
        cursor: pointer;
    }

    body {
        @apply min-h-dvh bg-background font-sans text-foreground antialiased;
        -webkit-text-size-adjust: 100%;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        text-rendering: optimizeLegibility;
    }
}
```

`tw-animate-css` встановить `shadcn add` на кроці 5; якщо ні, встанови його окремо: `npm i tw-animate-css`.

- [x] **Step 5: Згенеруй базові компоненти shadcn**

```bash
npx shadcn@latest add button input label sonner -y
```

Якщо CLI пропонує переписати `src/index.css` або `cn.ts`, відмовся: токени вже стоять. Потім:
- `npm uninstall next-themes`: sonner від shadcn тягне його, нам теми не потрібні.

- [x] **Step 6: Підлаштуй `button.tsx` під канвас**

У згенерованому `src/components/ui/button.tsx` лиши тіло компонента (`Slot` / `asChild`) і заміни конфіг `cva`:

```ts
const buttonVariants = cva(
    [
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-base font-medium whitespace-nowrap transition-colors outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4.5'
    ],
    {
        variants: {
            variant: {
                default: 'bg-primary font-semibold text-primary-foreground hover:bg-white',
                secondary: 'border border-border bg-secondary text-secondary-foreground hover:bg-accent',
                ghost: 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                destructive: 'border border-danger-border bg-danger-bg font-semibold text-danger hover:bg-danger-bg/80',
                link: 'h-auto p-0 text-link underline-offset-4 hover:text-link-hover hover:underline'
            },
            size: {
                'default': 'h-11 px-4',
                'lg': 'h-12 rounded-xl px-5',
                'icon': 'size-11',
                'icon-sm': 'size-10 rounded-md'
            }
        },
        defaultVariants: {
            variant: 'default',
            size: 'default'
        }
    }
);
```

- [x] **Step 7: Підлаштуй `input.tsx`, `label.tsx`, `sonner.tsx`**

`input.tsx`: клас інпута замінити на

```ts
'h-11 w-full min-w-0 rounded-lg border border-input bg-field px-3.5 text-base text-foreground transition-colors outline-none placeholder:text-placeholder focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50'
```

`label.tsx`: клас — `'text-sm font-medium text-label select-none'`.

`sonner.tsx` повністю:

```tsx
import type { CSSProperties } from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

// Тема тільки темна, тож next-themes не потрібен
const Toaster = (props: ToasterProps) => (
    <Sonner
        theme="dark"
        position="top-center"
        style={
            {
                '--normal-bg': 'var(--popover)',
                '--normal-text': 'var(--popover-foreground)',
                '--normal-border': 'var(--border)'
            } as CSSProperties
        }
        { ...props }
    />
);

export { Toaster };
```

- [x] **Step 8: Переведи toast-и на sonner**

Скрізь у `src`:
- `import toast from 'react-hot-toast'` → `import { toast } from 'sonner'`;
- `import { Toaster } from 'react-hot-toast'` → `import { Toaster } from '@/components/ui/sonner'`.

В `App.tsx` замість `<Toaster position="top-right" />` став `<Toaster />`. API сумісний: `toast.success(text, { id })`, `toast.error(text, { id })`. Потім видали залежність:

```bash
npm uninstall react-hot-toast
```

- [x] **Step 9: Тестове середовище jsdom**

`src/test/viewport.ts`:

```ts
import { vi } from 'vitest';

// useMediaQuery читає matchMedia; тест вирішує, десктоп це (від md) чи телефон
export const mockViewport = (desktop: boolean) => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: desktop && query.includes('min-width'),
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn()
    }));
};
```

`src/test/setup.ts`:

```ts
import { beforeEach } from 'vitest';

import { mockViewport } from './viewport';

// jsdom не має ResizeObserver і pointer capture, без них падають примітиви Radix
globalThis.ResizeObserver = class {
    observe() {}

    unobserve() {}

    disconnect() {}
};
Element.prototype.hasPointerCapture = () => false;
Element.prototype.releasePointerCapture = () => {};
Element.prototype.scrollIntoView = () => {};

beforeEach(() => {
    mockViewport(false);
});
```

У `vitest.config.ts`, проєкт `frontend`, додай `setupFiles: [ './src/test/setup.ts' ]`. З тестів прибери ручні `window.matchMedia = …` у `beforeEach`: їх тепер ставить setup.

- [x] **Step 10: ESLint для `src/components/ui`**

`button.tsx` експортує `buttonVariants` поруч із компонентом, через що спрацьовує правило `react-refresh/only-export-components`. Додай в `eslint.config.mjs` окремий блок:

```js
{
    files: [ 'src/components/ui/**/*.tsx' ],
    rules: {
        'react-refresh/only-export-components': 'off'
    }
},
```

- [x] **Step 11: `index.html`**

Прибери три рядки Google Fonts (`preconnect` ×2 і `css2?family=Open+Sans`) і зміни `theme-color` на `#0d0f1f`. `<div id="root-modal">` поки лишається: на нього спирається старий `Modal`, обидва видаляються в задачі 3.

- [x] **Step 12: Перевір**

Run: `npm run lint:fix && npm run typecheck && npm run test:once && npm run build`
Expected: усе зелене. Старі сторінки тимчасово темні з чорним текстом. Це нормально, їх замінять задачі 3–8.

Прожени сканери скіла `tailwind-format` по `src/components/ui/*.tsx` і виправ групування класів, якщо вони щось знайдуть.

- [x] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: dark theme tokens, shadcn/ui base components and sonner

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Бекенд — реєстрація та вхід поштою з паролем, перевірка зайнятої пошти

**Files:**
- Create: `convex/authRules.ts`, `convex/authRules.test.ts`, `convex/emailPassword.ts`, `convex/testing.ts`, `convex/testing.test.ts`
- Modify: `convex/auth.ts`, `convex/users.ts`, `convex/users.test.ts`, `convex/test.setup.ts`, `package.json`

**Interfaces:**
- Produces:
  - з `convex/authRules.ts`:
    - `MIN_PASSWORD_LENGTH = 8`;
    - `normalizeEmail(value: unknown): string` (кидає `ConvexError('Email is required')`);
    - `validatePassword(password: string): void` (кидає `ConvexError('Password must be at least 8 characters')`);
    - `type EmailStatus = 'free' | 'password' | 'google'`;
    - `takenEmailMessage(status: EmailStatus): string | null`;
    - тексти `EMAIL_TAKEN`, `EMAIL_LINKED_TO_GOOGLE`, `WRONG_CREDENTIALS`, `TOO_MANY_ATTEMPTS`;
  - `internal.users.emailStatus({ email: string }) → EmailStatus`;
  - `api.users.me` → `{ name: string, email: string, avatar: string } | null`;
  - `internal.testing.deleteE2eUsers({}) → number` — видаляє користувачів з поштою на `@e2e.test` разом з акаунтами, сесіями, refresh-токенами й іграми, де вони сидять; повертає кількість;
  - провайдер з `id: 'password'`: `signIn('password', { flow: 'signUp', name, email, password })` і `signIn('password', { flow: 'signIn', email, password })`. Користувацькі помилки — лише `ConvexError` з текстами вище.

Чому свій провайдер, а не `Password`: у штатного `Password` колбек `profile` синхронний, тож асинхронної перевірки пошти в ньому не зробиш. А його помилка `Account … already exists` — звичайний `Error`, який Convex на prod ховає. `ConvexCredentials`, `createAccount` і `retrieveAccount` — публічний API Convex Auth для власних провайдерів. `id` і хешування (Scrypt з `lucia`) ті самі, що в `Password`, тож пізніше на нього можна перейти без міграції акаунтів (розділ «Пізніше»).

- [x] **Step 1: Залежність**

`lucia` вже стоїть транзитивно (його використовує `@convex-dev/auth`). Закріпи його прямою залежністю, щоб імпорт не залежав від того, як npm розкладе пакети:

```bash
npm i lucia@^3.2.0
```

npm попередить, що `lucia` 3 deprecated. Це очікувано: Convex Auth 0.0.96 сам на ньому працює.

- [x] **Step 2: Тест правил (падає)**

`convex/authRules.test.ts`:

```ts
import { expect, test } from 'vitest';

import { EMAIL_LINKED_TO_GOOGLE, EMAIL_TAKEN, MIN_PASSWORD_LENGTH, normalizeEmail, takenEmailMessage, validatePassword } from './authRules';

test('passwords shorter than the minimum are rejected', () => {
    expect(() => {
        validatePassword('a'.repeat(MIN_PASSWORD_LENGTH - 1));
    }).toThrow('Password must be at least 8 characters');
});

test('a password of exactly the minimum length is accepted', () => {
    expect(() => {
        validatePassword('a'.repeat(MIN_PASSWORD_LENGTH));
    }).not.toThrow();
});

test('emails are trimmed and lowercased', () => {
    expect(normalizeEmail('  Alice@Example.COM ')).toBe('alice@example.com');
});

test('a missing email is rejected', () => {
    expect(() => normalizeEmail(undefined)).toThrow('Email is required');
});

test('a taken email gets a message that says how to get in', () => {
    expect(takenEmailMessage('free')).toBeNull();
    expect(takenEmailMessage('password')).toBe(EMAIL_TAKEN);
    expect(takenEmailMessage('google')).toBe(EMAIL_LINKED_TO_GOOGLE);
    expect(EMAIL_TAKEN).toBe('An account with this email already exists. Sign in instead');
    expect(EMAIL_LINKED_TO_GOOGLE).toBe('This email is linked to Google. Continue with Google instead');
});
```

Run: `npx vitest run convex/authRules.test.ts`
Expected: FAIL, бо модуля `./authRules` ще немає.

- [x] **Step 3: Реалізуй `convex/authRules.ts`**

```ts
import { ConvexError } from 'convex/values';

export const MIN_PASSWORD_LENGTH = 8;

export const EMAIL_TAKEN = 'An account with this email already exists. Sign in instead';
export const EMAIL_LINKED_TO_GOOGLE = 'This email is linked to Google. Continue with Google instead';
export const WRONG_CREDENTIALS = 'Wrong email or password';
export const TOO_MANY_ATTEMPTS = 'Too many attempts. Try again later';

// 'google' — пошта є в users, але без акаунта з паролем: зараз так буває лише після входу через Google
export type EmailStatus = 'free' | 'password' | 'google';

// Один акаунт на адресу незалежно від регістру й випадкових пробілів
export const normalizeEmail = (value: unknown): string => {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new ConvexError('Email is required');
    }

    return value.trim().toLowerCase();
};

export const validatePassword = (password: string) => {
    if (password.length < MIN_PASSWORD_LENGTH) {
        throw new ConvexError(`Password must be at least ${ MIN_PASSWORD_LENGTH } characters`);
    }
};

export const takenEmailMessage = (status: EmailStatus): string | null => {
    if (status === 'password') {
        return EMAIL_TAKEN;
    }

    return status === 'google' ? EMAIL_LINKED_TO_GOOGLE : null;
};
```

Run: `npx vitest run convex/authRules.test.ts`
Expected: PASS.

- [x] **Step 4: Тест `emailStatus` і пошти в `me` (падає)**

У `convex/test.setup.ts` функція `asUser` вставляє ще `email: \`${ name.toLowerCase() }@example.com\``.

У `convex/users.test.ts`:
- очікування в тесті `me returns the name and avatar of the signed-in user` доповни полем `email: 'alice@example.com'`;
- допиши тести:

```ts
import { internal } from './_generated/api';

test('a fresh email is free', async () => {
    const t = setup();

    expect(await t.query(internal.users.emailStatus, { email: 'nobody@example.com' })).toBe('free');
});

// Review Focus 1: пошта з паролем уже зайнята
test('an email with a password account is taken', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');

    await t.run(async ctx => {
        await ctx.db.insert('authAccounts', {
            userId: alice.userId,
            provider: 'password',
            providerAccountId: 'alice@example.com',
            secret: 'hash'
        });
    });

    expect(await t.query(internal.users.emailStatus, { email: 'alice@example.com' })).toBe('password');
});

// Review Focus 2: людина з Google не отримує другого акаунта на ту саму пошту
test('an email known only from Google sign-in points to Google', async () => {
    const t = setup();

    await asUser(t, 'Alice');

    expect(await t.query(internal.users.emailStatus, { email: 'alice@example.com' })).toBe('google');
});
```

Run: `npx vitest run convex/users.test.ts`
Expected: FAIL: немає `internal.users.emailStatus` і поля `email` у `me`.

- [x] **Step 5: `convex/users.ts`**

У `me` додай `email: user.email ?? ''` між `name` і `avatar`. Нижче — внутрішній запит:

```ts
import { internalQuery } from './_generated/server';
import type { EmailStatus } from './authRules';

// Лише для провайдера пошти: публічного «чи зайнята пошта» немає, щоб адреси не можна було перебирати
export const emailStatus = internalQuery({
    args: { email: v.string() },
    handler: async (ctx, { email }): Promise<EmailStatus> => {
        const account = await ctx.db
            .query('authAccounts')
            .withIndex('providerAndAccountId', q => q.eq('provider', 'password').eq('providerAccountId', email))
            .unique();

        if (account) {
            return 'password';
        }

        const user = await ctx.db
            .query('users')
            .withIndex('email', q => q.eq('email', email))
            .first();

        return user ? 'google' : 'free';
    }
});
```

`v` імпортується з `convex/values`, `internalQuery` додається до наявного імпорту з `./_generated/server`.

Run: `npm run test:once`
Expected: PASS (включно з `games.test.ts`).

- [x] **Step 6: Провайдер `convex/emailPassword.ts`**

```ts
import { ConvexCredentials } from '@convex-dev/auth/providers/ConvexCredentials';
import { createAccount, retrieveAccount } from '@convex-dev/auth/server';
import { ConvexError } from 'convex/values';
import { Scrypt } from 'lucia';

import { internal } from './_generated/api';
import type { DataModel } from './_generated/dataModel';
import { normalizeEmail, takenEmailMessage, TOO_MANY_ATTEMPTS, validatePassword, WRONG_CREDENTIALS } from './authRules';

const scrypt = new Scrypt();

// Замість Password: перевірка пошти тут асинхронна, а помилки — ConvexError, які видно й на prod.
// id і Scrypt ті самі, що в Password, тож пізніше перейти на нього можна без міграції акаунтів
export const EmailPassword = ConvexCredentials<DataModel>({
    id: 'password',
    authorize: async (params, ctx) => {
        const email = normalizeEmail(params.email);
        const password = typeof params.password === 'string' ? params.password : '';

        if (params.flow === 'signUp') {
            validatePassword(password);

            const taken = takenEmailMessage(await ctx.runQuery(internal.users.emailStatus, { email }));

            if (taken) {
                throw new ConvexError(taken);
            }

            const name = typeof params.name === 'string' ? params.name.trim() : '';
            const { user } = await createAccount(ctx, {
                provider: 'password',
                account: { id: email, secret: password },
                profile: { email, ...(name ? { name } : {}) }
            });

            return { userId: user._id };
        }

        if (params.flow === 'signIn') {
            // retrieveAccount кидає звичайні Error (InvalidAccountId, InvalidSecret, TooManyFailedAttempts) — на prod їх не видно
            const retrieved = await retrieveAccount(ctx, {
                provider: 'password',
                account: { id: email, secret: password }
            }).catch((error: unknown) => {
                const tooMany = error instanceof Error && error.message.includes('TooManyFailedAttempts');

                throw new ConvexError(tooMany ? TOO_MANY_ATTEMPTS : WRONG_CREDENTIALS);
            });

            if (!retrieved) {
                throw new ConvexError(WRONG_CREDENTIALS);
            }

            return { userId: retrieved.user._id };
        }

        throw new ConvexError('Unsupported sign-in flow');
    },
    crypto: {
        hashSecret: async password => scrypt.hash(password),
        verifySecret: async (password, hash) => scrypt.verify(hash, password)
    }
});
```

Перед тим як писати, звір сигнатури з установленою версією:

```bash
grep -n "export declare function createAccount\|export declare function retrieveAccount" -A30 node_modules/@convex-dev/auth/dist/server/implementation/index.d.ts
grep -n "crypto\|authorize" node_modules/@convex-dev/auth/dist/providers/ConvexCredentials.d.ts
```

Якщо типи відрізняються (наприклад, `retrieveAccount` повертає не `null`, а кидає помилку), підлаштуй код, але не змінюй поведінку: усі помилки для людини — `ConvexError` з текстами з `authRules.ts`.

- [x] **Step 7: Підключи провайдер у `convex/auth.ts`**

```ts
import Google from '@auth/core/providers/google';
import { convexAuth } from '@convex-dev/auth/server';

import { EmailPassword } from './emailPassword';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [ Google, EmailPassword ]
});
```

Run: `npm run typecheck && npm run test:once`
Expected: PASS.

- [x] **Step 8: Тест прибирання e2e-користувачів (падає)**

`convex/testing.test.ts`:

```ts
import { expect, test } from 'vitest';

import { internal } from './_generated/api';
import { emptyBoard } from './rules';
import { setup } from './test.setup';

test('removes only e2e users, with their accounts, sessions and games', async () => {
    const t = setup();
    const ids = await t.run(async ctx => {
        const tester = await ctx.db.insert('users', { name: 'E2E', email: 'e2e-1@e2e.test' });
        const real = await ctx.db.insert('users', { name: 'Alice', email: 'alice@example.com' });
        const session = await ctx.db.insert('authSessions', { userId: tester, expirationTime: Date.now() + 60_000 });

        await ctx.db.insert('authAccounts', { userId: tester, provider: 'password', providerAccountId: 'e2e-1@e2e.test', secret: 'hash' });
        await ctx.db.insert('authAccounts', { userId: real, provider: 'password', providerAccountId: 'alice@example.com', secret: 'hash' });
        await ctx.db.insert('authRefreshTokens', { sessionId: session, expirationTime: Date.now() + 60_000 });
        await ctx.db.insert('games', { code: 'e2e-game', board: emptyBoard(), turn: 'circle', circle: { userId: tester, score: 0 }, cross: null, result: null });
        await ctx.db.insert('games', { code: 'real-game', board: emptyBoard(), turn: 'circle', circle: { userId: real, score: 0 }, cross: null, result: null });

        return { tester, real };
    });

    expect(await t.mutation(internal.testing.deleteE2eUsers, {})).toBe(1);

    await t.run(async ctx => {
        expect(await ctx.db.get('users', ids.tester)).toBeNull();
        expect(await ctx.db.get('users', ids.real)).not.toBeNull();
        expect((await ctx.db.query('authAccounts').collect()).map(account => account.providerAccountId)).toEqual([ 'alice@example.com' ]);
        expect(await ctx.db.query('authSessions').collect()).toHaveLength(0);
        expect(await ctx.db.query('authRefreshTokens').collect()).toHaveLength(0);
        expect((await ctx.db.query('games').collect()).map(game => game.code)).toEqual([ 'real-game' ]);
    });
});
```

Якщо вставка в `authSessions` чи `authRefreshTokens` падає на валідації схеми, звір обов'язкові поля з `authTables` (`node_modules/@convex-dev/auth/dist/server/implementation/types.js`) і доповни вставку.

Run: `npx vitest run convex/testing.test.ts`
Expected: FAIL, бо `internal.testing` ще немає.

- [x] **Step 9: `convex/testing.ts`**

```ts
import { internalMutation } from './_generated/server';

export const E2E_EMAIL_DOMAIN = '@e2e.test';

// Прибирання після e2e-тестів і перевірок у браузері. Лише internal: викликається через `npx convex run`, з браузера недоступна
export const deleteE2eUsers = internalMutation({
    args: {},
    handler: async ctx => {
        const users = (await ctx.db.query('users').collect()).filter(user => user.email?.endsWith(E2E_EMAIL_DOMAIN));
        const ids = new Set(users.map(user => user._id));

        for (const game of await ctx.db.query('games').collect()) {
            if ((game.circle && ids.has(game.circle.userId)) || (game.cross && ids.has(game.cross.userId))) {
                await ctx.db.delete('games', game._id);
            }
        }

        for (const user of users) {
            const accounts = await ctx.db.query('authAccounts').withIndex('userIdAndProvider', q => q.eq('userId', user._id)).collect();
            const sessions = await ctx.db.query('authSessions').withIndex('userId', q => q.eq('userId', user._id)).collect();

            for (const account of accounts) {
                await ctx.db.delete('authAccounts', account._id);
            }

            for (const session of sessions) {
                const tokens = await ctx.db.query('authRefreshTokens').withIndex('sessionId', q => q.eq('sessionId', session._id)).collect();

                for (const token of tokens) {
                    await ctx.db.delete('authRefreshTokens', token._id);
                }

                await ctx.db.delete('authSessions', session._id);
            }

            await ctx.db.delete('users', user._id);
        }

        return users.length;
    }
});
```

Функція потрапить і на prod. Там вона теж безпечна: торкається лише адрес `@e2e.test`, і викликати її може тільки власник через CLI.

Run: `npm run test:once`
Expected: PASS.

- [x] **Step 10: Перевірка в dev**

`npx convex dev` має бути запущений і без помилок завантажити функції. Перевір провайдер прямо через CLI:

```bash
npx convex run auth:signIn '{ "provider": "password", "params": { "flow": "signUp", "name": "E2E", "email": "e2e-cli@e2e.test", "password": "tictac2026" } }'
```

Очікувано:
- перший запуск повертає токени;
- повторний — помилку `An account with this email already exists. Sign in instead`;
- `"flow": "signIn"` з паролем `wrong-pass-1` — `Wrong email or password`.

Потім прибери тестового користувача:

```bash
npx convex run testing:deleteE2eUsers
```

Очікувано: `1`.

- [x] **Step 11: Commit**

```bash
git add convex package.json package-lock.json
git commit -m "feat(convex): email and password sign-up with a taken-email check

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Каркас застосунку — шапка, меню, підтвердження виходу, поширення інвайта

**Files:**
- Create:
  - `src/components/ui/{dropdown-menu,sheet,alert-dialog,avatar}.tsx`;
  - `src/hooks/useMediaQuery.ts`, `src/hooks/useFrom.ts`, `src/hooks/useLeaveGame.ts`;
  - `src/lib/invite.ts`, `src/lib/invite.test.ts`, `src/lib/initials.ts`;
  - `src/components/{Logo,UserAvatar,CopyButton,LeaveGameDialog,AccountMenu,MobileMenu,AppHeader,AppLayout}/…`, `src/components/AppHeader/AppHeader.test.tsx`.
- Modify: `src/App.tsx`, `src/routes/PublicRoute/PublicRoute.tsx`, `src/components/Spinner/Spinner.tsx`, `vitest.config.ts`, `index.html`
- Delete: `src/components/{NavBar,UserMenu,Modal,Overlay,Container}`, `src/hooks/useEscapeKey.ts`, `src/assets/bg.jpg`

**Interfaces:**
- Consumes: `Button`, `toast`, `api.users.me` → `{ name, email, avatar }`, `api.games.leave({ code })`.
- Produces:
  - `useMediaQuery(query: string): boolean`, `DESKTOP = '(min-width: 48rem)'`;
  - `useFrom(): string` — `location.state.from ?? '/'`;
  - `useLeaveGame(gameCode: string | null): (intent: LeaveIntent) => Promise<void>`, `type LeaveIntent = 'lobby' | 'signOut'`;
  - `inviteLink(code: string): string`, `copyText(text: string, success: string): Promise<void>`, `shareInvite(code: string): Promise<void>`;
  - `initials(name: string): string`;
  - `<UserAvatar name avatar tone? size? />` (`tone: 'circle' | 'cross'`, `size: 'sm' | 'md' | 'lg'`);
  - `<CopyButton text label success />`;
  - `<Logo />`;
  - `<AppLayout />` (рендерить `<Outlet />`).

- [x] **Step 1: Згенеруй компоненти**

```bash
npx shadcn@latest add dropdown-menu sheet alert-dialog avatar -y
npm run lint:fix
```

Далі прожени сканери `tailwind-format` по нових файлах. Стилі під канвас:
- **dropdown-menu:** `DropdownMenuContent` — `rounded-xl border-border bg-popover p-1.5 shadow-2xl`; `DropdownMenuItem` — `min-h-11 rounded-lg px-2.5 text-sm focus:bg-accent`; варіант `destructive` — `text-danger focus:text-danger`.
- **alert-dialog:** контент — `rounded-2xl border-border bg-card`, оверлей — `bg-[#080916]/70`. Це єдиний hex у класах: прозорість саме цього відтінку токеном не задати. Або заведи `--overlay: rgb(8 9 22 / 0.72)` і клас `bg-(--overlay)`.
- **sheet:** контент справа — `w-82 border-l-border bg-card`.

- [x] **Step 2: Хуки**

`src/hooks/useMediaQuery.ts`:

```ts
import { useSyncExternalStore } from 'react';

export const DESKTOP = '(min-width: 48rem)';

const useMediaQuery = (query: string): boolean => useSyncExternalStore(
    onChange => {
        const list = window.matchMedia(query);

        list.addEventListener('change', onChange);

        return () => {
            list.removeEventListener('change', onChange);
        };
    },
    () => window.matchMedia(query).matches
);

export default useMediaQuery;
```

`src/hooks/useFrom.ts`:

```ts
import { useLocation } from 'react-router';

// Куди повернути людину після входу: PrivateRoute кладе сюди шлях разом із query
const useFrom = (): string => (useLocation().state as { from?: string } | null)?.from ?? '/';

export default useFrom;
```

`src/hooks/useLeaveGame.ts` переносить логіку `onOk` зі старого `NavBar`:

```ts
import { useAuthActions } from '@convex-dev/auth/react';
import { useMutation } from 'convex/react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import errorMessage from '@/lib/errorMessage';
import { api } from '@convex/_generated/api';

export type LeaveIntent = 'lobby' | 'signOut';

const useLeaveGame = (gameCode: string | null) => {
    const { signOut } = useAuthActions();
    const leave = useMutation(api.games.leave);
    const navigate = useNavigate();

    return async (intent: LeaveIntent) => {
        // Спершу йдемо на `/`, щоб сторінка гри не показала спінер для гри, якої для нас уже немає
        navigate('/');

        if (gameCode) {
            try {
                await leave({ code: gameCode });
            } catch (error) {
                toast.error(errorMessage(error));
            }
        }

        // Підтверджений вихід розлогінює, навіть якщо вихід із гри не вдався
        if (intent === 'signOut') {
            try {
                await signOut();
            } catch (error) {
                toast.error(errorMessage(error));
            }
        }
    };
};

export default useLeaveGame;
```

- [x] **Step 3: Тест інвайта (падає)**

`src/lib/invite.test.ts`:

```ts
import { afterEach, expect, test, vi } from 'vitest';

import { shareInvite } from './invite';

const { success, error } = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock('sonner', () => ({ toast: { success, error } }));

const writeText = vi.fn();

const setNavigator = (share?: (data: ShareData) => Promise<void>) => {
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
};

afterEach(() => {
    writeText.mockReset();
    success.mockReset();
    error.mockReset();
});

test('copies the invite link when the browser cannot share', async () => {
    writeText.mockResolvedValue(undefined);
    setNavigator(undefined);

    await shareInvite('g 1');

    expect(writeText).toHaveBeenCalledWith(`${ window.location.origin }/game/g%201`);
    expect(success).toHaveBeenCalledWith('Invite link copied');
});

test('opens the share sheet when the browser can share', async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    setNavigator(share);

    await shareInvite('g1');

    expect(share).toHaveBeenCalledWith({
        title: 'tic·tac·toe',
        text: 'Join my game of tic·tac·toe',
        url: `${ window.location.origin }/game/g1`
    });
    expect(writeText).not.toHaveBeenCalled();
});

// Review Focus 4: закрите меню «Поділитися» — не помилка
test('stays quiet when the person closes the share sheet', async () => {
    setNavigator(vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError')));

    await shareInvite('g1');

    expect(writeText).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
});
```

Run: `npx vitest run src/lib/invite.test.ts`
Expected: FAIL, бо модуля `./invite` ще немає.

- [x] **Step 4: Реалізуй `src/lib/invite.ts` і `src/lib/initials.ts`**

```ts
import { toast } from 'sonner';

export const inviteLink = (code: string) => `${ window.location.origin }/game/${ encodeURIComponent(code) }`;

export const copyText = async (text: string, success: string) => {
    try {
        await navigator.clipboard.writeText(text);
        toast.success(success);
    } catch {
        toast.error('Could not copy. Select the text and copy it manually');
    }
};

// Телефон: системне меню «Поділитися»; браузер без Web Share отримує копію лінка
export const shareInvite = async (code: string) => {
    const url = inviteLink(code);

    if (typeof navigator.share !== 'function') {
        await copyText(url, 'Invite link copied');

        return;
    }

    try {
        await navigator.share({ title: 'tic·tac·toe', text: 'Join my game of tic·tac·toe', url });
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            return;
        }

        await copyText(url, 'Invite link copied');
    }
};
```

`src/lib/initials.ts`:

```ts
export const firstName = (name: string) => name.trim().split(/\s+/)[ 0 ] || 'Player';

export default (name: string) => name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[ 0 ]?.toUpperCase() ?? '')
    .join('') || '?';
```

Run: `npx vitest run src/lib/invite.test.ts`
Expected: PASS.

- [x] **Step 5: Дрібні компоненти**

`Logo/Logo.tsx`: знак 32×32 (квадрат `rounded-[9px]` з фоном `fill-secondary`, нолик `stroke-circle`, хрестик `stroke-cross`) і напис.

```tsx
import type { FC } from 'react';

import cn from '@/lib/cn';

const Logo: FC<{ className?: string }> = ({ className }) => (
    <span className={ cn('flex items-center gap-2.5', className) }>
        <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            aria-hidden="true"
        >
            <rect
                width="32"
                height="32"
                rx="9"
                className="fill-secondary"
            />
            <circle
                cx="10.5"
                cy="16"
                r="4.5"
                fill="none"
                strokeWidth="2.5"
                className="stroke-circle"
            />
            <path
                d="M18 11.5l9 9M27 11.5l-9 9"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="stroke-cross"
            />
        </svg>
        <span className="font-display text-xl font-bold tracking-tight text-foreground">tic·tac·toe</span>
    </span>
);

export default Logo;
```

`UserAvatar/UserAvatar.tsx`:

```tsx
import type { FC } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import cn from '@/lib/cn';
import initials from '@/lib/initials';

type UserAvatarProps = {
    name: string,
    avatar: string,
    tone?: 'circle' | 'cross',
    size?: 'sm' | 'md' | 'lg'
};

const SIZE = { sm: 'size-8 text-xs', md: 'size-11 text-sm', lg: 'size-13 text-base' };

// referrerPolicy потрібен аватаркам з googleusercontent.com: без нього вони іноді віддають 403
const UserAvatar: FC<UserAvatarProps> = ({ name, avatar, tone = 'circle', size = 'md' }) => (
    <Avatar className={ SIZE[ size ] }>
        { avatar && (
            <AvatarImage
                src={ avatar }
                alt=""
                referrerPolicy="no-referrer"
            />
        ) }
        <AvatarFallback
            className={
                cn('font-semibold text-foreground', {
                    'bg-border': tone === 'circle',
                    'bg-cross-soft': tone === 'cross'
                })
            }
        >
            { initials(name) }
        </AvatarFallback>
    </Avatar>
);

export default UserAvatar;
```

`CopyButton/CopyButton.tsx` — квадратна кнопка 44px з іконкою `Copy`, після кліку на 1,5 с іконка змінюється на `Check`:

```tsx
import { Check, Copy } from 'lucide-react';
import { type FC, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { copyText } from '@/lib/invite';

type CopyButtonProps = {
    text: string,
    label: string,
    success: string
};

const CopyButton: FC<CopyButtonProps> = ({ text, label, success }) => {
    const [ copied, setCopied ] = useState(false);

    useEffect(
        () => {
            if (!copied) {
                return;
            }

            const timer = setTimeout(() => {
                setCopied(false);
            }, 1500);

            return () => {
                clearTimeout(timer);
            };
        },
        [ copied ]
    );

    return (
        <Button
            variant="secondary"
            size="icon"
            aria-label={ label }
            onClick={
                async () => {
                    await copyText(text, success);
                    setCopied(true);
                }
            }
        >
            { copied ? <Check /> : <Copy /> }
        </Button>
    );
};

export default CopyButton;
```

`Spinner/Spinner.tsx` (замість `react-loader-spinner`):

```tsx
import { LoaderCircle } from 'lucide-react';
import type { FC } from 'react';

const Spinner: FC = () => (
    <div className="flex grow items-center justify-center py-20">
        <LoaderCircle
            aria-label="Loading"
            className="size-8 animate-spin text-muted-foreground"
        />
    </div>
);

export default Spinner;
```

Далі:
- `npm uninstall react-loader-spinner`;
- з `vitest.config.ts` прибери `server: { deps: { inline: [ 'react-loader-spinner' ] } }` разом із коментарем.

- [x] **Step 6: `LeaveGameDialog`**

```tsx
import type { FC } from 'react';

import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import type { LeaveIntent } from '@/hooks/useLeaveGame';

const COPY: Record<LeaveIntent, { title: string, action: string }> = {
    lobby: { title: 'Leave the game?', action: 'Leave game' },
    signOut: { title: 'Sign out?', action: 'Sign out' }
};

type LeaveGameDialogProps = {
    intent: LeaveIntent | null,
    onCancel: () => void,
    onConfirm: () => void
};

const LeaveGameDialog: FC<LeaveGameDialogProps> = ({ intent, onCancel, onConfirm }) => {
    const copy = COPY[ intent ?? 'lobby' ];

    return (
        <AlertDialog
            open={ intent !== null }
            onOpenChange={
                open => {
                    if (!open) {
                        onCancel();
                    }
                }
            }
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-display text-2xl font-bold">{ copy.title }</AlertDialogTitle>
                    <AlertDialogDescription>The current game ends for both players, and the score is lost.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className={ buttonVariants({ variant: 'secondary' }) }>Stay</AlertDialogCancel>
                    <AlertDialogAction
                        className={ buttonVariants({ variant: 'destructive' }) }
                        onClick={ onConfirm }
                    >
                        { copy.action }
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default LeaveGameDialog;
```

- [x] **Step 7: `AccountMenu` (десктоп) і `MobileMenu` (телефон)**

Спільні пропси: `{ gameCode: string | null, onRequest: (intent: LeaveIntent) => void }`. Обидва беруть `me` з `useQuery(api.users.me)`.

`AccountMenu/AccountMenu.tsx` (артборди `Lobby`, `GameOpponent`):

```tsx
import { useQuery } from 'convex/react';
import { ArrowLeft, ChevronDown, Copy, Link2, LogOut } from 'lucide-react';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import UserAvatar from '@/components/UserAvatar';
import type { LeaveIntent } from '@/hooks/useLeaveGame';
import { copyText, inviteLink } from '@/lib/invite';
import { api } from '@convex/_generated/api';

type AccountMenuProps = {
    gameCode: string | null,
    onRequest: (intent: LeaveIntent) => void
};

const AccountMenu: FC<AccountMenuProps> = ({ gameCode, onRequest }) => {
    const me = useQuery(api.users.me);
    const name = me?.name ?? '';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="secondary"
                    className="rounded-full bg-card pr-3 pl-1.5"
                >
                    <UserAvatar
                        name={ name }
                        avatar={ me?.avatar ?? '' }
                        size="sm"
                    />
                    { name }
                    <ChevronDown className="text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-75"
            >
                <DropdownMenuLabel className="flex items-center gap-3 p-2.5 font-normal">
                    <UserAvatar
                        name={ name }
                        avatar={ me?.avatar ?? '' }
                        size="md"
                    />
                    <span className="flex min-w-0 flex-col gap-1">
                        <span className="truncate text-sm font-semibold">{ name }</span>
                        <span className="truncate text-sm text-muted-foreground">{ me?.email }</span>
                    </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                { gameCode && (
                    <>
                        <DropdownMenuItem
                            onSelect={
                                () => {
                                    void copyText(gameCode, 'Game ID copied');
                                }
                            }
                        >
                            <span className="flex min-w-0 flex-col gap-1">
                                <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Game ID</span>
                                <span className="truncate font-mono">{ gameCode }</span>
                            </span>
                            <Copy className="ml-auto" />
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onSelect={
                                () => {
                                    void copyText(inviteLink(gameCode), 'Invite link copied');
                                }
                            }
                        >
                            <Link2 />
                            Copy invite link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={
                                () => {
                                    onRequest('lobby');
                                }
                            }
                        >
                            <ArrowLeft />
                            Back to lobby
                        </DropdownMenuItem>
                    </>
                ) }
                <DropdownMenuItem
                    variant="destructive"
                    onSelect={
                        () => {
                            onRequest('signOut');
                        }
                    }
                >
                    <LogOut />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default AccountMenu;
```

`MobileMenu/MobileMenu.tsx` (артборд `MobileMenu`) — `Sheet` справа. Вміст:
1. `SheetTitle` «Menu».
2. Блок користувача: `UserAvatar size="lg"`, повне ім'я `text-lg font-semibold`, пошта `text-muted-foreground`.
3. `<hr className="border-border">`.
4. У грі:
   - «Game ID» з рядком ID і `CopyButton`;
   - кнопка `ghost h-13 w-full justify-start text-base text-foreground` «Share invite link» з іконкою `Share2`, яка викликає `shareInvite(gameCode)`;
   - другий `<hr>`;
   - «Back to lobby» (`ArrowLeft`).
5. «Sign out» (`LogOut`, `text-danger`).
6. У грі внизу (`mt-auto`) підказка: «Back to lobby and Sign out end the current game for both players. You confirm first.»

Тригер:

```tsx
<SheetTrigger asChild>
    <Button
        variant="secondary"
        size="icon"
        aria-label="Open menu"
        className="rounded-full bg-card"
    >
        <Menu />
    </Button>
</SheetTrigger>
```

Стан `open` керований: кожна дія спершу `setOpen(false)`, потім `onRequest(…)`. Додай `SheetDescription className="sr-only"` «Account and game», бо Radix попереджає без опису.

- [x] **Step 8: Тест шапки (падає)**

`src/components/AppHeader/AppHeader.test.tsx` — перенесений тест зі старого `NavBar.test.tsx` плюс нові сценарії:

```tsx
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConvexError } from 'convex/values';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import { Toaster } from '@/components/ui/sonner';
import { mockViewport } from '@/test/viewport';

import AppHeader from './AppHeader';

const leave = vi.fn();
const signOut = vi.fn();

vi.mock('convex/react', () => ({
    useMutation: () => leave,
    useQuery: () => ({ name: 'Alice Smith', email: 'alice@example.com', avatar: '' })
}));

vi.mock('@convex-dev/auth/react', () => ({
    useAuthActions: () => ({ signOut })
}));

const renderAt = (path: string) => render(
    <MemoryRouter initialEntries={ [ path ] }>
        <Toaster />
        <Routes>
            <Route
                path="/"
                element={ <><AppHeader /><p>lobby page</p></> }
            />
            <Route
                path="/game/:gameId"
                element={ <><AppHeader /><p>game page</p></> }
            />
        </Routes>
    </MemoryRouter>
);

afterEach(() => {
    cleanup();
    leave.mockReset();
    signOut.mockReset();
});

// Перенесено з NavBar.test: підтверджений вихід розлогінює, навіть якщо вихід із гри не вдався
test('signs out after confirming even when leaving the game fails', async () => {
    mockViewport(true);
    leave.mockRejectedValue(new ConvexError('Something went wrong'));
    signOut.mockResolvedValue(undefined);

    const user = userEvent.setup();

    renderAt('/game/g1');

    await user.click(screen.getByRole('button', { name: /Alice Smith/ }));
    await user.click(await screen.findByRole('menuitem', { name: 'Sign out' }));
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));

    await waitFor(() => {
        expect(leave).toHaveBeenCalledWith({ code: 'g1' });
    });
    await waitFor(() => {
        expect(signOut).toHaveBeenCalledTimes(1);
    });
});

test('signs out from the lobby without asking, since there is no game to end', async () => {
    mockViewport(true);
    signOut.mockResolvedValue(undefined);

    const user = userEvent.setup();

    renderAt('/');

    await user.click(screen.getByRole('button', { name: /Alice Smith/ }));
    await user.click(await screen.findByRole('menuitem', { name: 'Sign out' }));

    await waitFor(() => {
        expect(signOut).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(leave).not.toHaveBeenCalled();
});

// Review Focus 5: логотип посеред гри не кидає місце в грі без підтвердження
test('asks before leaving the game through the logo', async () => {
    mockViewport(true);
    leave.mockResolvedValue(null);

    const user = userEvent.setup();

    renderAt('/game/g1');

    await user.click(screen.getByRole('link', { name: 'tic·tac·toe home' }));

    const dialog = await screen.findByRole('alertdialog');

    expect(within(dialog).getByText('Leave the game?')).toBeTruthy();
    expect(screen.getByText('game page')).toBeTruthy();

    await user.click(within(dialog).getByRole('button', { name: 'Leave game' }));

    expect(await screen.findByText('lobby page')).toBeTruthy();
    expect(leave).toHaveBeenCalledWith({ code: 'g1' });
});

test('the phone menu offers to share the invite link', async () => {
    const user = userEvent.setup();

    renderAt('/game/g1');

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(await screen.findByRole('button', { name: /Share invite link/ })).toBeTruthy();
    expect(screen.getByText('g1')).toBeTruthy();
    expect(screen.getByText('Alice Smith')).toBeTruthy();
});
```

Run: `npx vitest run src/components/AppHeader`
Expected: FAIL, бо `./AppHeader` ще не існує.

- [x] **Step 9: `AppHeader` і `AppLayout`**

`AppHeader/AppHeader.tsx`:

```tsx
import { type FC, useState } from 'react';
import { Link, useMatch } from 'react-router';

import AccountMenu from '@/components/AccountMenu';
import LeaveGameDialog from '@/components/LeaveGameDialog';
import Logo from '@/components/Logo';
import MobileMenu from '@/components/MobileMenu';
import useLeaveGame, { type LeaveIntent } from '@/hooks/useLeaveGame';
import useMediaQuery, { DESKTOP } from '@/hooks/useMediaQuery';
import cn from '@/lib/cn';

const AppHeader: FC = () => {
    const gameCode = useMatch('/game/:gameId')?.params.gameId ?? null;
    const isDesktop = useMediaQuery(DESKTOP);
    const leaveGame = useLeaveGame(gameCode);
    const [ confirm, setConfirm ] = useState<LeaveIntent | null>(null);

    // У грі будь-який вихід питає підтвердження; у лобі гри немає, тож Sign out одразу
    const onRequest = (intent: LeaveIntent) => {
        if (gameCode) {
            setConfirm(intent);

            return;
        }

        void leaveGame(intent);
    };

    return (
        <header className="border-b border-secondary">
            <div
                className={
                    cn([
                        'mx-auto flex h-18 max-w-280 items-center justify-between gap-4 px-5',
                        'md:px-8'
                    ])
                }
            >
                <Link
                    to="/"
                    aria-label="tic·tac·toe home"
                    onClick={
                        event => {
                            if (gameCode) {
                                event.preventDefault();
                                setConfirm('lobby');
                            }
                        }
                    }
                >
                    <Logo />
                </Link>
                { isDesktop
                    ? (
                        <AccountMenu
                            gameCode={ gameCode }
                            onRequest={ onRequest }
                        />
                    )
                    : (
                        <MobileMenu
                            gameCode={ gameCode }
                            onRequest={ onRequest }
                        />
                    ) }
            </div>
            <LeaveGameDialog
                intent={ confirm }
                onCancel={
                    () => {
                        setConfirm(null);
                    }
                }
                onConfirm={
                    () => {
                        const intent = confirm;

                        setConfirm(null);

                        if (intent) {
                            void leaveGame(intent);
                        }
                    }
                }
            />
        </header>
    );
};

export default AppHeader;
```

`AppLayout/AppLayout.tsx`:

```tsx
import type { FC } from 'react';
import { Outlet } from 'react-router';

import AppHeader from '@/components/AppHeader';
import cn from '@/lib/cn';

const AppLayout: FC = () => (
    <div className="flex min-h-dvh flex-col">
        <AppHeader />
        <main
            className={
                cn([
                    'mx-auto flex w-full max-w-280 grow flex-col px-5 py-6',
                    'md:px-8 md:py-10'
                ])
            }
        >
            <Outlet />
        </main>
    </div>
);

export default AppLayout;
```

- [x] **Step 10: Маршрути й `PublicRoute`**

`PublicRoute` повертає людину туди, звідки вона прийшла. Інакше після входу поштою він кидав би на `/` раніше, ніж сторінка встигне перейти на `from`:

```tsx
const PublicRoute: FC<PublicRouteProps> = ({ children, restricted = false }) => {
    const { isAuthenticated } = useConvexAuth();
    const from = useFrom();

    if (isAuthenticated && restricted) {
        return (
            <Navigate
                to={ from }
                replace
            />
        );
    }

    return children;
};
```

`App.tsx`:

```tsx
const App: FC = () => {
    const { isLoading } = useConvexAuth();

    return (
        <>
            <Toaster />
            { isLoading
                ? <Spinner />
                : (
                    <Routes>
                        <Route
                            path="/login"
                            element={ <PublicRoute restricted><LoginPage /></PublicRoute> }
                        />
                        <Route element={ <PrivateRoute><AppLayout /></PrivateRoute> }>
                            <Route
                                path="/"
                                element={ <HomePage /> }
                            />
                            <Route
                                path="/game/:gameId"
                                element={ <GamePage /> }
                            />
                        </Route>
                        <Route
                            path="*"
                            element={
                                <Navigate
                                    to="/"
                                    replace
                                />
                            }
                        />
                    </Routes>
                ) }
        </>
    );
};
```

`LoginPage` поки старий: його замінить задача 4. Далі:
- видали теки `NavBar`, `UserMenu`, `Modal`, `Overlay`, `Container`, файли `hooks/useEscapeKey.ts`, `assets/bg.jpg`;
- прибери `<div id="root-modal">` з `index.html`;
- перевір, що старі `HomePage` і `GamePage` не імпортують видалене: `GamePage` імпортує лише `Button`, `Cell`, `Player`, `Spinner`, `Statistics`, `Waiting`. Якщо `Waiting` тягне `Overlay`, тимчасово заміни `Overlay` в ньому на звичайний `div` з тими самими класами — `Waiting` все одно видаляється в задачі 8.

- [x] **Step 11: Тест `PublicRoute` (падає, потім проходить)**

`src/routes/PublicRoute/PublicRoute.test.tsx`:

```tsx
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import PublicRoute from './PublicRoute';

vi.mock('convex/react', () => ({
    useConvexAuth: () => ({ isAuthenticated: true, isLoading: false })
}));

afterEach(() => {
    cleanup();
});

// Review Focus 3: після входу поштою людина йде туди, звідки прийшла, а не в лобі
test('a signed-in visitor on an auth page goes back to where they came from', () => {
    render(
        <MemoryRouter initialEntries={ [ { pathname: '/login', state: { from: '/game/g1' } } ] }>
            <Routes>
                <Route
                    path="/login"
                    element={ <PublicRoute restricted><p>login page</p></PublicRoute> }
                />
                <Route
                    path="/game/:gameId"
                    element={ <p>game page</p> }
                />
            </Routes>
        </MemoryRouter>
    );

    expect(screen.getByText('game page')).toBeTruthy();
});
```

Run: `npm run test:once`
Expected: PASS. Тест `NavBar.test.tsx` видалено разом із `NavBar`, його сценарій тепер у `AppHeader.test.tsx`.

- [x] **Step 12: Перевірка в браузері — у задачі 5**

Поки немає реєстрації поштою, увійти можна лише через Google, а це вручну. Шапку й меню Claude перевірить у задачі 5 під тестовим користувачем. Якщо хочеш побачити шапку раніше, увійди сам через Google на `npm run dev`.

- [x] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: app header with account dropdown, phone menu and leave confirmation

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Вхід — сторінка Sign in і тексти помилок

**Files:**
- Create:
  - `src/lib/authError.ts`, `src/lib/authError.test.ts`;
  - `src/components/{AuthSplitLayout,HeroBoard,GoogleButton,PasswordInput,FieldError,OrDivider}/…`;
  - `src/pages/SignInPage/{SignInPage.tsx,index.ts,SignInPage.test.tsx}`.
- Modify: `src/App.tsx`, `src/routes/PrivateRoute/PrivateRoute.test.tsx`, `package.json`
- Delete: `src/pages/LoginPage`

**Interfaces:**
- Consumes: `useFrom()`, `Button`, `Input`, `Label`, `Logo`, Convex Auth `signIn(provider, params) → Promise<{ signingIn: boolean }>`, тексти з `@convex/authRules`.
- Produces:
  - `type AuthFlow = 'signIn' | 'signUp'`;
  - `authError(error: unknown, flow: AuthFlow): string`;
  - `<AuthSplitLayout hero headline lead footnote>`, `<GoogleButton label />`, `<PasswordInput … />`, `<FieldError>`, `<OrDivider />`.

- [x] **Step 1: Залежності форм**

```bash
npm i react-hook-form zod @hookform/resolvers
```

- [x] **Step 2: Тест текстів помилок (падає)**

`src/lib/authError.test.ts`:

```ts
import { ConvexError } from 'convex/values';
import { expect, test } from 'vitest';

import { EMAIL_TAKEN, WRONG_CREDENTIALS } from '@convex/authRules';

import authError from './authError';

test('a message from the server is shown as is', () => {
    expect(authError(new ConvexError(EMAIL_TAKEN), 'signUp')).toBe(EMAIL_TAKEN);
    expect(authError(new ConvexError(WRONG_CREDENTIALS), 'signIn')).toBe(WRONG_CREDENTIALS);
});

// Мережа, збій сервера або прихований на prod Error — у кожного сценарію свій зрозумілий текст
test('any other error gets the fallback of its flow', () => {
    expect(authError(new Error('[Request ID: 1] Server Error'), 'signIn')).toBe('Could not sign in. Try again');
    expect(authError(new Error('[Request ID: 1] Server Error'), 'signUp')).toBe('Could not create the account. Try again');
});
```

Run: `npx vitest run src/lib/authError.test.ts`
Expected: FAIL, бо модуля ще немає.

- [x] **Step 3: Реалізуй `src/lib/authError.ts`**

```ts
import { ConvexError } from 'convex/values';

export type AuthFlow = 'signIn' | 'signUp';

const FALLBACK: Record<AuthFlow, string> = {
    signIn: 'Could not sign in. Try again',
    signUp: 'Could not create the account. Try again'
};

// Провайдер пошти кидає ConvexError з готовим текстом (видно й на prod); решта помилок отримує запасний текст сценарію
const authError = (error: unknown, flow: AuthFlow): string => {
    if (error instanceof ConvexError && typeof error.data === 'string') {
        return error.data;
    }

    return FALLBACK[ flow ];
};

export default authError;
```

Run: `npx vitest run src/lib/authError.test.ts`
Expected: PASS.

- [x] **Step 4: Спільні компоненти сторінок входу**

- **`FieldError`:** `<p role="alert" className="flex items-center gap-1.5 text-sm text-danger"><CircleAlert className="size-3.5" />{ children }</p>`, рендерить `null` без `children`.
- **`OrDivider`:** рядок `flex items-center gap-3 text-sm text-subtle` — лінія `h-px flex-1 bg-border`, текст «or with email», ще одна лінія.
- **`PasswordInput`:** `Input` з `type` password/text і кнопкою `Button variant="ghost" size="icon"` праворуч (`absolute top-0 right-0.5`). Кнопка показує іконку `Eye` / `EyeOff` з `aria-label` «Show password» / «Hide password». Пропси такі самі, як в `Input` (через `ComponentProps<typeof Input>`), `ref` передається далі для `register`.
- **`GoogleButton`:**

```tsx
const GoogleButton: FC<{ label: string }> = ({ label }) => {
    const { signIn } = useAuthActions();
    const from = useFrom();

    return (
        <Button
            variant="secondary"
            className="w-full"
            onClick={
                () => {
                    // Google OAuth іде повним редиректом і повертає на `from` (той самий /game/:id, якщо прийшли з посилання)
                    signIn('google', { redirectTo: from }).catch((error: unknown) => {
                        toast.error(errorMessage(error));
                    });
                }
            }
        >
            <GoogleIcon />
            { label }
        </Button>
    );
};
```

`GoogleIcon` — чотирикольоровий знак «G» (18×18) з артборду `Main.dc.html`, чотири `path` з `fill` `#4285F4`, `#34A853`, `#FBBC05`, `#EA4335`. Кольори бренду Google — єдине місце, де hex лишається в розмітці.

- **`HeroBoard`** (`variant: 'diagonal' | 'column'`): SVG 320×320 з лівої панелі `Main` (`diagonal`: нолики на діагоналі 0-4-8) і `SignUp` (`column`: хрестики в середній колонці). Розмітку SVG перенеси з артбордів, кольори — через класи `stroke-border`, `stroke-circle`, `stroke-cross`, `stroke-foreground`.
- **`AuthSplitLayout`** (артборди `Main`, `SignUp`, `MobileSignIn`, `MobileSignUp`):

```tsx
type AuthSplitLayoutProps = {
    hero: 'diagonal' | 'column',
    headline: ReactNode,
    lead: string,
    footnote: string,
    children: ReactNode
};

const AuthSplitLayout: FC<AuthSplitLayoutProps> = ({ hero, headline, lead, footnote, children }) => (
    <div className="flex min-h-dvh">
        <section
            className={
                cn([
                    'hidden',
                    'md:flex md:flex-1 md:flex-col md:justify-between md:gap-12 md:border-r md:border-line md:bg-muted md:px-14 md:py-12'
                ])
            }
        >
            <Logo />
            <div className="flex flex-col gap-8">
                <HeroBoard variant={ hero } />
                <div className="flex max-w-115 flex-col gap-4">
                    <h1 className="font-display text-5xl leading-none font-extrabold tracking-tight">{ headline }</h1>
                    <p className="text-lg leading-relaxed text-muted-foreground">{ lead }</p>
                </div>
            </div>
            <p className="text-sm text-subtle">{ footnote }</p>
        </section>
        <section
            className={
                cn([
                    'flex flex-1 flex-col px-6 pt-14 pb-8',
                    'md:items-center md:justify-center md:py-12'
                ])
            }
        >
            <div className="flex w-full max-w-95 flex-col gap-6">
                <Logo className="md:hidden" />
                { children }
            </div>
        </section>
    </div>
);
```

- [x] **Step 5: Тест сторінки входу (падає)**

`src/pages/SignInPage/SignInPage.test.tsx`:

```tsx
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConvexError } from 'convex/values';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import SignInPage from './SignInPage';

const signIn = vi.fn();

vi.mock('@convex-dev/auth/react', () => ({
    useAuthActions: () => ({ signIn })
}));

const renderSignIn = () => render(
    <MemoryRouter initialEntries={ [ { pathname: '/login', state: { from: '/game/g1' } } ] }>
        <Routes>
            <Route
                path="/login"
                element={ <SignInPage /> }
            />
            <Route
                path="/game/:gameId"
                element={ <p>game page</p> }
            />
        </Routes>
    </MemoryRouter>
);

const fillAndSubmit = async (email: string, password: string) => {
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Email'), email);
    await user.type(screen.getByLabelText('Password'), password);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
};

afterEach(() => {
    cleanup();
    signIn.mockReset();
});

test('signs in with email and password and returns to the original page', async () => {
    signIn.mockResolvedValue({ signingIn: true });

    renderSignIn();
    await fillAndSubmit(' Alice@Example.com ', 'secret123');

    expect(signIn).toHaveBeenCalledWith('password', { email: 'alice@example.com', password: 'secret123', flow: 'signIn' });
    expect(await screen.findByText('game page')).toBeTruthy();
});

test('a wrong password shows the server message and stays on the page', async () => {
    signIn.mockRejectedValue(new ConvexError('Wrong email or password'));

    renderSignIn();
    await fillAndSubmit('alice@example.com', 'wrong-pass');

    expect(await screen.findByText('Wrong email or password')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
});

test('an invalid email is caught before calling the server', async () => {
    renderSignIn();
    await fillAndSubmit('not-an-email', 'secret123');

    expect(await screen.findByText('Enter a valid email')).toBeTruthy();
    expect(signIn).not.toHaveBeenCalled();
});

test('Google sign-in redirects back to the original page', async () => {
    signIn.mockResolvedValue({ signingIn: false });

    renderSignIn();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Continue with Google' }));

    expect(signIn).toHaveBeenCalledWith('google', { redirectTo: '/game/g1' });
});
```

Run: `npx vitest run src/pages/SignInPage`
Expected: FAIL, бо `./SignInPage` ще немає.

- [x] **Step 6: `SignInPage`** (артборди `Main`, `MobileSignIn`, без лінка «Forgot password?»)

```tsx
import { useAuthActions } from '@convex-dev/auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { type FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { z } from 'zod';

import AuthSplitLayout from '@/components/AuthSplitLayout';
import FieldError from '@/components/FieldError';
import GoogleButton from '@/components/GoogleButton';
import OrDivider from '@/components/OrDivider';
import PasswordInput from '@/components/PasswordInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useFrom from '@/hooks/useFrom';
import authError from '@/lib/authError';

const schema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email({ error: 'Enter a valid email' })),
    password: z.string().min(1, { error: 'Enter your password' })
});

type Values = z.infer<typeof schema>;

const SignInPage: FC = () => {
    const { signIn } = useAuthActions();
    const navigate = useNavigate();
    const from = useFrom();
    const [ formError, setFormError ] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

    const onSubmit = handleSubmit(async ({ email, password }) => {
        setFormError(null);

        try {
            await signIn('password', { email, password, flow: 'signIn' });
            navigate(from, { replace: true });
        } catch (error) {
            setFormError(authError(error, 'signIn'));
        }
    });

    return (
        <AuthSplitLayout
            hero="diagonal"
            headline={ <>Three in a row.<br />Two players.<br />One game ID.</> }
            lead="Create a game, send the ID to a friend and play in real time from any device."
            footnote="No installs. Moves sync instantly."
        >
            <div className="flex flex-col gap-2">
                <h2 className="font-display text-3xl font-bold tracking-tight">Sign in</h2>
                <p className="text-muted-foreground">Welcome back. Your games are waiting.</p>
            </div>
            <GoogleButton label="Continue with Google" />
            <OrDivider />
            <form
                noValidate
                className="flex flex-col gap-4"
                onSubmit={ onSubmit }
            >
                <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        aria-invalid={ errors.email ? true : undefined }
                        { ...register('email') }
                    />
                    <FieldError>{ errors.email?.message }</FieldError>
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput
                        id="password"
                        autoComplete="current-password"
                        placeholder="Your password"
                        aria-invalid={ errors.password || formError ? true : undefined }
                        { ...register('password') }
                    />
                    <FieldError>{ errors.password?.message ?? formError }</FieldError>
                </div>
                <Button
                    type="submit"
                    size="lg"
                    disabled={ isSubmitting }
                    className="mt-1"
                >
                    Sign in
                </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground">
                New here?
                { ' ' }
                <Link
                    to="/signup"
                    state={ { from } }
                    className="font-medium text-link hover:text-link-hover"
                >
                    Create an account
                </Link>
            </p>
        </AuthSplitLayout>
    );
};

export default SignInPage;
```

Run: `npx vitest run src/pages/SignInPage`
Expected: PASS.

- [x] **Step 7: Маршрут і старий тест `PrivateRoute`**

- В `App.tsx`: `/login` тепер рендерить `<SignInPage />`.
- Видали `src/pages/LoginPage`.
- У `PrivateRoute.test.tsx`:
  - імпорт `LoginPage` → `SignInPage`;
  - кнопка `'Login with google'` → `'Continue with Google'`;
  - мок `useAuthActions` лишається.

Run: `npm run test:once`
Expected: PASS.

- [x] **Step 8: Перевірка в браузері (Claude, Playwright MCP)**

На `npm run dev`, без входу:
- `/login` на 1280px і 390px — знімки звір з `docs/design/Main.dc.html` і `docs/design/MobileSignIn.dc.html`. «Forgot password?» немає, це очікувано.
- Неправильна пошта (`not-an-email`) — «Enter a valid email» під полем, запит не йде.

Неправильний пароль для справжнього акаунта перевіриться в задачі 5, коли з'явиться реєстрація.

- [x] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: email and password sign-in page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Реєстрація

**Files:**
- Create:
  - `src/lib/passwordStrength.ts`, `src/lib/passwordStrength.test.ts`;
  - `src/pages/SignUpPage/{SignUpPage.tsx,index.ts,SignUpPage.test.tsx}`.
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useFrom`, `authError`, `MIN_PASSWORD_LENGTH` і тексти з `@convex/authRules`, `AuthSplitLayout`, `GoogleButton`, `PasswordInput`, `FieldError`, `OrDivider`.
- Produces: `passwordStrength(password: string): 0 | 1 | 2 | 3`.

- [x] **Step 1: Тест сили пароля (падає)**

`src/lib/passwordStrength.test.ts`:

```ts
import { expect, test } from 'vitest';

import passwordStrength from './passwordStrength';

test.each([
    [ 'short', 0 ],
    [ 'onlyletters', 1 ],
    [ 'tictac2026', 2 ],
    [ 'tic-tac-2026!', 3 ]
] as const)('%s has strength %i', (password, strength) => {
    expect(passwordStrength(password)).toBe(strength);
});
```

Run: `npx vitest run src/lib/passwordStrength.test.ts`
Expected: FAIL, бо модуля ще немає.

- [x] **Step 2: `src/lib/passwordStrength.ts`**

```ts
import { MIN_PASSWORD_LENGTH } from '@convex/authRules';

// 0 — замало символів; далі кожен рівень додає різноманітність символів
const passwordStrength = (password: string): 0 | 1 | 2 | 3 => {
    if (password.length < MIN_PASSWORD_LENGTH) {
        return 0;
    }

    const mixed = /[a-z]/i.test(password) && /\d/.test(password);

    if (!mixed) {
        return 1;
    }

    return password.length >= 12 && /[^a-z\d]/i.test(password) ? 3 : 2;
};

export default passwordStrength;
```

Run: `npx vitest run src/lib/passwordStrength.test.ts`
Expected: PASS.

- [x] **Step 3: Тести реєстрації (падають)**

`src/pages/SignUpPage/SignUpPage.test.tsx`:

```tsx
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConvexError } from 'convex/values';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import { EMAIL_LINKED_TO_GOOGLE, EMAIL_TAKEN } from '@convex/authRules';

import SignUpPage from './SignUpPage';

const signIn = vi.fn();

vi.mock('@convex-dev/auth/react', () => ({
    useAuthActions: () => ({ signIn })
}));

const renderSignUp = () => render(
    <MemoryRouter initialEntries={ [ { pathname: '/signup', state: { from: '/game/g1' } } ] }>
        <Routes>
            <Route
                path="/signup"
                element={ <SignUpPage /> }
            />
            <Route
                path="/game/:gameId"
                element={ <p>game page</p> }
            />
        </Routes>
    </MemoryRouter>
);

const fill = async (name: string, email: string, password: string) => {
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Name'), name);
    await user.type(screen.getByLabelText('Email'), email);
    await user.type(screen.getByLabelText('Password'), password);
    await user.click(screen.getByRole('button', { name: 'Create account' }));
};

afterEach(() => {
    cleanup();
    signIn.mockReset();
});

test('a short password is rejected before calling the server', async () => {
    renderSignUp();
    await fill('Alice Smith', 'alice@example.com', 'short');

    expect(await screen.findByText('Password must be at least 8 characters')).toBeTruthy();
    expect(signIn).not.toHaveBeenCalled();
});

// Review Focus 3: після реєстрації людина повертається в гру з посилання
test('creates the account and returns to the original page', async () => {
    signIn.mockResolvedValue({ signingIn: true });

    renderSignUp();
    await fill('Alice Smith', 'Alice@Example.com', 'tictac2026');

    expect(signIn).toHaveBeenCalledWith('password', {
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'tictac2026',
        flow: 'signUp'
    });
    expect(await screen.findByText('game page')).toBeTruthy();
});

// Review Focus 1
test('an email with an account says to sign in instead', async () => {
    signIn.mockRejectedValue(new ConvexError(EMAIL_TAKEN));

    renderSignUp();
    await fill('Alice Smith', 'alice@example.com', 'tictac2026');

    expect(await screen.findByText(EMAIL_TAKEN)).toBeTruthy();
    expect(screen.queryByText('game page')).toBeNull();
});

// Review Focus 2
test('an email used with Google says to continue with Google', async () => {
    signIn.mockRejectedValue(new ConvexError(EMAIL_LINKED_TO_GOOGLE));

    renderSignUp();
    await fill('Alice Smith', 'alice@example.com', 'tictac2026');

    expect(await screen.findByText(EMAIL_LINKED_TO_GOOGLE)).toBeTruthy();
});
```

Run: `npx vitest run src/pages/SignUpPage`
Expected: FAIL, бо `./SignUpPage` ще немає.

- [x] **Step 4: `SignUpPage`** (артборди `SignUp`, `MobileSignUp`)

```tsx
import { useAuthActions } from '@convex-dev/auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { type FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { z } from 'zod';

import AuthSplitLayout from '@/components/AuthSplitLayout';
import FieldError from '@/components/FieldError';
import GoogleButton from '@/components/GoogleButton';
import OrDivider from '@/components/OrDivider';
import PasswordInput from '@/components/PasswordInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useFrom from '@/hooks/useFrom';
import authError from '@/lib/authError';
import cn from '@/lib/cn';
import passwordStrength from '@/lib/passwordStrength';
import { MIN_PASSWORD_LENGTH } from '@convex/authRules';

const schema = z.object({
    name: z.string().trim().min(1, { error: 'Enter your name' }).max(40, { error: 'Keep it under 40 characters' }),
    email: z.string().trim().toLowerCase().pipe(z.email({ error: 'Enter a valid email' })),
    password: z.string().min(MIN_PASSWORD_LENGTH, { error: `Password must be at least ${ MIN_PASSWORD_LENGTH } characters` })
});

type Values = z.infer<typeof schema>;

const SignUpPage: FC = () => {
    const { signIn } = useAuthActions();
    const navigate = useNavigate();
    const from = useFrom();
    const [ formError, setFormError ] = useState<string | null>(null);
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });
    const strength = passwordStrength(watch('password') ?? '');

    const onSubmit = handleSubmit(async ({ name, email, password }) => {
        setFormError(null);

        try {
            await signIn('password', { name, email, password, flow: 'signUp' });
            navigate(from, { replace: true });
        } catch (error) {
            setFormError(authError(error, 'signUp'));
        }
    });

    return (
        <AuthSplitLayout
            hero="column"
            headline={ <>Your name on<br />every scoreboard.</> }
            lead="One account for every device. Sign in with Google or with your email."
            footnote="Your email is only used to sign in."
        >
            <div className="flex flex-col gap-2">
                <h2 className="font-display text-3xl font-bold tracking-tight">Create an account</h2>
                <p className="text-muted-foreground">It takes less than a minute.</p>
            </div>
            <GoogleButton label="Sign up with Google" />
            <OrDivider />
            <form
                noValidate
                className="flex flex-col gap-4"
                onSubmit={ onSubmit }
            >
                <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        autoComplete="nickname"
                        placeholder="Shown to your opponent"
                        aria-invalid={ errors.name ? true : undefined }
                        { ...register('name') }
                    />
                    <FieldError>{ errors.name?.message }</FieldError>
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        aria-invalid={ errors.email ? true : undefined }
                        { ...register('email') }
                    />
                    <FieldError>{ errors.email?.message }</FieldError>
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput
                        id="password"
                        autoComplete="new-password"
                        aria-describedby="password-hint"
                        aria-invalid={ errors.password ? true : undefined }
                        { ...register('password') }
                    />
                    <div
                        aria-hidden="true"
                        className="grid grid-cols-3 gap-1.5"
                    >
                        { [ 0, 1, 2 ].map(level => (
                            <span
                                key={ level }
                                className={ cn('h-1 rounded-full', level < strength ? 'bg-circle' : 'bg-border') }
                            />
                        )) }
                    </div>
                    { errors.password
                        ? <FieldError>{ errors.password.message }</FieldError>
                        : (
                            <p
                                id="password-hint"
                                className="text-sm text-muted-foreground"
                            >
                                At least 8 characters; a mix of letters and digits is stronger.
                            </p>
                        ) }
                </div>
                <FieldError>{ formError }</FieldError>
                <Button
                    type="submit"
                    size="lg"
                    disabled={ isSubmitting }
                >
                    Create account
                </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground">
                Already have an account?
                { ' ' }
                <Link
                    to="/login"
                    state={ { from } }
                    className="font-medium text-link hover:text-link-hover"
                >
                    Sign in
                </Link>
            </p>
        </AuthSplitLayout>
    );
};

export default SignUpPage;
```

`footnote` відходить від канвасу: там написано про коди на пошту, яких поки немає.

Run: `npx vitest run src/pages/SignUpPage`
Expected: PASS.

- [x] **Step 5: Маршрут**

В `App.tsx` поруч із `/login`:

```tsx
<Route
    path="/signup"
    element={ <PublicRoute restricted><SignUpPage /></PublicRoute> }
/>
```

Run: `npm run lint:fix && npm run typecheck && npm run test:once`
Expected: PASS.

- [x] **Step 6: Перевірка в браузері (Claude, Playwright MCP)**

На `npm run dev`, адреса `e2e-check-<час>@e2e.test`:
1. `/game/e2e-check-1?mark=circle` без входу → перекидає на `/login` → «Create an account» → ім'я, пошта, пароль → одразу в грі `e2e-check-1` з «Waiting for an opponent».
2. Шапка й меню з задачі 3 на 1280px і 390px — звір з дропдауном на `docs/design/Lobby.dc.html` і з `docs/design/MobileMenu.dc.html`.
3. «Sign out» з підтвердженням → `/signup` з тією самою поштою → «An account with this email already exists. Sign in instead».
4. `/login` з неправильним паролем → «Wrong email or password»; з правильним → лобі.
5. `/signup` на 1280px і 390px — звір з `docs/design/SignUp.dc.html` і `docs/design/MobileSignUp.dc.html`.

Сценарій з поштою Google-акаунта покритий тестами задач 2 і 5: справжню пошту власника у форму не вводимо. Наприкінці:

```bash
npx convex run testing:deleteE2eUsers
```

- [x] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: sign-up with email and password

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Скидання пароля — відкладено

Задачу перенесено в розділ «Пізніше» разом із підтвердженням пошти. Номер лишено, щоб не зсувати посилання на задачі 7–10. Переходь до задачі 7.

---

### Task 7: Лобі — нова гра і приєднання

**Files:**
- Create: `src/components/ui/tabs.tsx`, `src/components/MarkIcon/MarkIcon.tsx` (переписати), `src/components/MarkPicker/…`
- Modify: `src/pages/HomePage/HomePage.tsx`, `src/pages/HomePage/HomePage.test.tsx`
- Delete: `src/components/RadioInput`

**Interfaces:**
- Consumes: `api.users.me`, `CopyButton`, `copyText`, `firstName`, `Button`, `Input`, `Label`, `FieldError`.
- Produces:
  - `<MarkIcon mark className? />` — SVG `viewBox 0 0 100 100`, нолик `stroke-circle`, хрестик `stroke-cross`, товщина 12, розмір задається класом;
  - `<MarkPicker value onChange />` на нативних радіо.

- [x] **Step 1: Тести лобі (падають)**

`src/pages/HomePage/HomePage.test.tsx` повністю:

```tsx
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation, useParams } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import { Toaster } from '@/components/ui/sonner';

import HomePage from './HomePage';

vi.mock('nanoid', () => ({ nanoid: () => 'fresh-id' }));

vi.mock('convex/react', () => ({
    useQuery: () => ({ name: 'Alex Kim', email: 'alex@example.com', avatar: '' })
}));

const GameProbe = () => <p>{ `game ${ useParams().gameId } ${ useLocation().search }` }</p>;

const renderLobby = () => render(
    <MemoryRouter initialEntries={ [ '/' ] }>
        <Toaster />
        <Routes>
            <Route
                path="/"
                element={ <HomePage /> }
            />
            <Route
                path="/game/:gameId"
                element={ <GameProbe /> }
            />
        </Routes>
    </MemoryRouter>
);

afterEach(() => {
    cleanup();
});

test('greets the player by first name', () => {
    renderLobby();

    expect(screen.getByRole('heading', { name: 'Ready for a round, Alex?' })).toBeTruthy();
});

// Перенесено з відкладеної дрібниці №2: ID, введений на вкладці Join, не стає ID нової гри
test('a game ID typed on Join never becomes the new game ID', async () => {
    const user = userEvent.setup();

    renderLobby();
    await user.click(screen.getByRole('tab', { name: 'Join a game' }));
    await user.type(screen.getByLabelText('Game ID'), 'someone-elses-game');
    await user.click(screen.getByRole('tab', { name: 'New game' }));
    await user.click(screen.getByRole('button', { name: /Create game/ }));

    expect(await screen.findByText('game fresh-id ?mark=circle')).toBeTruthy();
});

test('the chosen mark goes with the new game', async () => {
    const user = userEvent.setup();

    renderLobby();
    await user.click(screen.getByLabelText(/Cross/));
    await user.click(screen.getByRole('button', { name: /Create game/ }));

    expect(await screen.findByText('game fresh-id ?mark=cross')).toBeTruthy();
});

test('joining needs a game ID', async () => {
    const user = userEvent.setup();

    renderLobby();
    await user.click(screen.getByRole('tab', { name: 'Join a game' }));
    await user.click(screen.getByRole('button', { name: /Join game/ }));

    expect(await screen.findByText('Enter the game ID')).toBeTruthy();
});

test('joining trims the ID and keeps it safe in the URL', async () => {
    const user = userEvent.setup();

    renderLobby();
    await user.click(screen.getByRole('tab', { name: 'Join a game' }));
    await user.type(screen.getByLabelText('Game ID'), '  abc def ');
    await user.click(screen.getByRole('button', { name: /Join game/ }));

    expect(await screen.findByText('game abc def')).toBeTruthy();
});

test('the generated ID can be copied', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    renderLobby();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Copy game ID' }));

    expect(writeText).toHaveBeenCalledWith('fresh-id');
    expect(await screen.findByText('Game ID copied')).toBeTruthy();
});
```

Run: `npx vitest run src/pages/HomePage`
Expected: FAIL (стара сторінка не має вкладок і нових підписів).

- [x] **Step 2: Компоненти**

```bash
npx shadcn@latest add tabs -y
npm run lint:fix
```

Стилі `tabs.tsx` за канвасом:
- `TabsList` — `grid w-full grid-cols-2 gap-1 rounded-xl border border-line bg-field p-1 h-auto`;
- `TabsTrigger` — `h-10 rounded-[9px] font-semibold text-muted-foreground data-[state=active]:bg-border data-[state=active]:text-foreground`.

`MarkIcon/MarkIcon.tsx`:

```tsx
import type { FC } from 'react';

import cn from '@/lib/cn';
import type { Mark } from '@convex/rules';

const MarkIcon: FC<{ mark: Mark, className?: string }> = ({ mark, className }) => (
    <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className={ cn('size-10', className) }
    >
        { mark === 'circle'
            ? (
                <circle
                    cx="50"
                    cy="50"
                    r="34"
                    fill="none"
                    strokeWidth="12"
                    className="stroke-circle"
                />
            )
            : (
                <path
                    d="M18 18 82 82M82 18 18 82"
                    strokeWidth="12"
                    strokeLinecap="round"
                    className="stroke-cross"
                />
            ) }
    </svg>
);

export default MarkIcon;
```

`MarkPicker/MarkPicker.tsx` — нативні радіо: доступно з клавіатури, тестується через `getByLabelText`.

```tsx
import type { FC } from 'react';

import MarkIcon from '@/components/MarkIcon';
import cn from '@/lib/cn';
import type { Mark } from '@convex/rules';

const OPTIONS: { mark: Mark, title: string, hint: string }[] = [
    { mark: 'circle', title: 'Circle', hint: 'Moves first' },
    { mark: 'cross', title: 'Cross', hint: 'Moves second' }
];

type MarkPickerProps = {
    value: Mark,
    onChange: (mark: Mark) => void
};

const MarkPicker: FC<MarkPickerProps> = ({ value, onChange }) => (
    <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-medium text-label">Play as</legend>
        <div className="grid grid-cols-2 gap-3">
            { OPTIONS.map(option => (
                <label
                    key={ option.mark }
                    className={
                        cn([
                            'flex cursor-pointer flex-col items-start gap-2.5 rounded-xl border-2 border-border bg-field p-3.5 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring',
                            'md:flex-row md:items-center md:gap-3.5 md:p-4'
                        ])
                    }
                    data-checked={ value === option.mark ? '' : undefined }
                >
                    <input
                        type="radio"
                        name="mark"
                        value={ option.mark }
                        checked={ value === option.mark }
                        className="sr-only"
                        onChange={
                            () => {
                                onChange(option.mark);
                            }
                        }
                    />
                    <MarkIcon
                        mark={ option.mark }
                        className="size-9"
                    />
                    <span className="flex flex-col gap-1">
                        <span className="font-semibold">{ option.title }</span>
                        <span className="text-sm text-muted-foreground">{ option.hint }</span>
                    </span>
                </label>
            )) }
        </div>
    </fieldset>
);

export default MarkPicker;
```

Підсвічування вибраної картки:
- нолик — `data-checked:border-circle data-checked:bg-circle/12`;
- хрестик — `data-checked:border-cross data-checked:bg-cross/12`.

Додай ці класи до `label` через об'єкт `cn` за `option.mark`.

- [x] **Step 3: `HomePage`** (артборди `Lobby`, `LobbyJoin`, `MobileLobby`, `MobileLobbyJoin`)

Стан:
- `type: 'new' | 'join'`;
- `mark: Mark`;
- `newCode` — `useState(() => nanoid())`;
- `joinCode`, `joinError`.

У кожної вкладки свій ID, тож старий баг зі спільним ID неможливий за побудовою.

Розмітка:
- **Заголовок:** `h1` «Ready for a round, {firstName(me?.name ?? '')}?» (`font-display text-3xl font-extrabold md:text-5xl`), під ним «Start a new game, or join a friend with the ID they sent you.».
- **Сітка:** `flex flex-wrap items-start gap-6`. Ліворуч картка `flex-[999_1_32rem] min-w-0 rounded-2xl border border-line bg-card p-7 flex flex-col gap-6`; на телефоні вона без рамки й фону (`max-md:` група). Праворуч `aside` «How it works» (`flex-[1_1_18rem]`, `hidden md:flex`): три кроки з номерами в кружечках `bg-secondary text-link`, тексти з артборду `Lobby` (для вкладки Join — з `LobbyJoin`).
- **`Tabs`:** `value={ type }`, `onValueChange={ value => { setType(value as GameType); } }`.
- **Вкладка `new`:**
  - `MarkPicker`;
  - блок «Game ID»: рядок `flex gap-2` з `p` (`h-11 flex-1 truncate rounded-lg border border-dashed border-border bg-field px-3.5 font-mono leading-11`, `{ newCode }`), кнопка `Button variant="secondary" size="icon" aria-label="Generate a new game ID"` (`RefreshCw`, `setNewCode(nanoid())`) і `CopyButton text={ newCode } label="Copy game ID" success="Game ID copied"`;
  - підпис «Generated for you. Your friend joins with this ID.»;
  - кнопка `Button size="lg"` «Create game» з `ArrowRight` → `navigate(\`/game/${ encodeURIComponent(newCode) }?mark=${ mark }\`)`.
- **Вкладка `join`** — `form` з `onSubmit`:
  - `Label htmlFor="join-code"` «Game ID»;
  - рядок з `Input id="join-code" className="font-mono" placeholder="Paste the ID your friend sent"` і кнопкою `aria-label="Paste from clipboard"` (`ClipboardPaste`, `navigator.clipboard.readText()`, при помилці toast «Could not read the clipboard»);
  - підпис «Opened an invite link? The ID is filled in for you.»;
  - картка-нотатка `role="note"`: `MarkIcon mark="cross"`, «You play as the free mark», «Circle moves first.»;
  - `FieldError`;
  - кнопка `type="submit"` «Join game» з `ArrowRight`;
  - обробник: `trim()`, порожній → `setJoinError('Enter the game ID')`, інакше `navigate(\`/game/${ encodeURIComponent(code) }\`)`.

Сервер сам віддає вільну позначку, тож у нотатці не можна обіцяти «Cross». Текст «You play as the free mark» трохи відходить від канвасу, і саме тому.

Видали `src/components/RadioInput`.

Run: `npx vitest run src/pages/HomePage`
Expected: PASS.

- [x] **Step 4: Перевірка в браузері (Claude, Playwright MCP)**

Під тестовим користувачем `@e2e.test` на `npm run dev`:
- **Лобі на 1280px і 390px.** Вкладка New — звір з `docs/design/Lobby.dc.html` і `docs/design/MobileLobby.dc.html`. Вкладка Join — з `docs/design/LobbyJoin.dc.html` і `docs/design/MobileLobbyJoin.dc.html`.
- **Поведінка.** Перемикання вкладок не губить вибір позначки, копіювання ID показує toast.

Наприкінці — `npx convex run testing:deleteE2eUsers`.

- [x] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: redesigned lobby with new game and join tabs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Екран гри — поле, гравці, статус ходу, очікування суперника

**Files:**
- Create:
  - `src/components/ui/{dialog,drawer}.tsx`;
  - `src/lib/gameStatus.ts`, `src/lib/gameStatus.test.ts`;
  - `src/components/{Board,BoardCell,PlayerCard,TurnStatus,WaitingForOpponent}/…`.
- Modify: `src/pages/GamePage/GamePage.tsx`, `src/pages/GamePage/GamePage.test.tsx`
- Delete: `src/components/{Button,Cell,Player,Statistics,Waiting}`

**Interfaces:**
- Consumes:
  - `GameView` (`board`, `turn`, `me`, `result: { kind: 'win', mark, line, cells } | { kind: 'draw' } | null`, `circle`/`cross: { name, avatar, score } | null`);
  - `otherMark` з `@convex/rules`, `firstName`;
  - `MarkIcon`, `UserAvatar`, `CopyButton`, `copyText`, `inviteLink`, `shareInvite`;
  - `useLeaveGame`, `useMediaQuery`, `Fade`, `FadeSwitch`.
- Produces:
  - `gameStatus(game: GameView): { text: string, hint: string | null, tone: 'circle' | 'cross' | 'muted', waiting: boolean }`;
  - `canMove(game: GameView): boolean`.

- [x] **Step 1: Тест статусу (падає)**

`src/lib/gameStatus.test.ts`:

```ts
import { expect, test } from 'vitest';

import type { GameView } from '@/types/game';

import { canMove, gameStatus } from './gameStatus';

const GAME: GameView = {
    code: 'g1',
    board: [ '', '', '', '', '', '', '', '', '' ],
    turn: 'circle',
    result: null,
    me: 'circle',
    circle: { name: 'Alex Kim', avatar: '', score: 2 },
    cross: { name: 'Sam Moreno', avatar: '', score: 1 }
};

test('my turn', () => {
    expect(gameStatus(GAME)).toEqual({ text: 'Your turn', hint: 'Tap an empty cell', tone: 'circle', waiting: false });
    expect(canMove(GAME)).toBe(true);
});

test('the opponent turn names them and locks the board', () => {
    const game: GameView = { ...GAME, turn: 'cross' };

    expect(gameStatus(game)).toEqual({
        text: 'Sam\'s turn',
        hint: 'Waiting for their move. The board unlocks on your turn.',
        tone: 'cross',
        waiting: true
    });
    expect(canMove(game)).toBe(false);
});

test('a round I won', () => {
    const game: GameView = { ...GAME, result: { kind: 'win', mark: 'circle', line: 'rotate_45', cells: [ 0, 4, 8 ] } };

    expect(gameStatus(game).text).toBe('You take the round');
    expect(gameStatus(game).hint).toBe('Next round starts in a moment');
    expect(canMove(game)).toBe(false);
});

test('a round the opponent won', () => {
    const game: GameView = { ...GAME, result: { kind: 'win', mark: 'cross', line: 'vertical', cells: [ 1, 4, 7 ] } };

    expect(gameStatus(game)).toMatchObject({ text: 'Sam takes the round', tone: 'cross' });
});

test('a draw', () => {
    expect(gameStatus({ ...GAME, result: { kind: 'draw' } })).toMatchObject({ text: 'Draw. Nobody takes this one', tone: 'muted' });
});

test('no moves while waiting for the second player', () => {
    expect(canMove({ ...GAME, cross: null })).toBe(false);
});
```

Run: `npx vitest run src/lib/gameStatus.test.ts`
Expected: FAIL, бо модуля ще немає.

- [x] **Step 2: `src/lib/gameStatus.ts`**

```ts
import { firstName } from '@/lib/initials';
import type { GameView } from '@/types/game';
import { otherMark } from '@convex/rules';

const NEXT_ROUND = 'Next round starts in a moment';

export type GameStatus = {
    text: string,
    hint: string | null,
    tone: 'circle' | 'cross' | 'muted',
    waiting: boolean
};

export const canMove = (game: GameView): boolean => Boolean(game.circle && game.cross) && !game.result && game.turn === game.me;

export const gameStatus = (game: GameView): GameStatus => {
    const opponent = firstName(game[ otherMark(game.me) ]?.name ?? '');

    if (game.result?.kind === 'win') {
        return {
            text: game.result.mark === game.me ? 'You take the round' : `${ opponent } takes the round`,
            hint: NEXT_ROUND,
            tone: game.result.mark,
            waiting: false
        };
    }

    if (game.result?.kind === 'draw') {
        return { text: 'Draw. Nobody takes this one', hint: NEXT_ROUND, tone: 'muted', waiting: false };
    }

    if (game.turn === game.me) {
        return { text: 'Your turn', hint: 'Tap an empty cell', tone: game.me, waiting: false };
    }

    return {
        text: `${ opponent }'s turn`,
        hint: 'Waiting for their move. The board unlocks on your turn.',
        tone: game.turn,
        waiting: true
    };
};
```

Run: `npx vitest run src/lib/gameStatus.test.ts`
Expected: PASS.

- [x] **Step 3: Тести сторінки гри (падають)**

`src/pages/GamePage/GamePage.test.tsx`. Перенеси три наявні тести з такими змінами:
- `Toaster` береться з `@/components/ui/sonner`, ручний `matchMedia` прибрано;
- додано мок `@convex-dev/auth/react` (`useAuthActions: () => ({ signOut: vi.fn() })`), бо `WaitingForOpponent` використовує `useLeaveGame`;
- `GAME`: імена `'Alice Smith'` і `'Bob Stone'`, у тестах шукаються саме вони;
- клітинка в тесті подвійного кліку шукається не через `.grid-cols-3`, а так: `screen.getByRole('button', { name: 'Row 2, column 2: empty' })`.

До імпортів додай `within` з `@testing-library/react` і `mockViewport` з `@/test/viewport`. Нові тести:

```tsx
test('locks the board while it is the opponent turn', async () => {
    enter.mockResolvedValue('already');
    queryResult = { ...GAME, turn: 'cross' };

    render(app('/game/g1'));

    expect(await screen.findByText('Bob\'s turn')).toBeTruthy();

    const cells = screen.getAllByRole('button', { name: /^Row \d, column \d/ });

    expect(cells).toHaveLength(9);
    expect(cells.every(cell => (cell as HTMLButtonElement).disabled)).toBe(true);
});

test('highlights the winning cells in the winner colour', async () => {
    enter.mockResolvedValue('already');
    queryResult = {
        ...GAME,
        board: [ 'circle', 'cross', '', 'cross', 'circle', '', '', '', 'circle' ],
        result: { kind: 'win', mark: 'circle', line: 'rotate_45', cells: [ 0, 4, 8 ] }
    };

    render(app('/game/g1'));

    expect(await screen.findByText('You take the round')).toBeTruthy();

    const winning = screen.getAllByRole('button', { name: /circle$/ });

    expect(winning.map(cell => cell.getAttribute('data-win'))).toEqual([ 'circle', 'circle', 'circle' ]);
    expect(screen.getByRole('button', { name: 'Row 1, column 2: cross' }).getAttribute('data-win')).toBeNull();
});

test('alone in the game, the desktop dialog offers the ID and the invite link', async () => {
    mockViewport(true);
    enter.mockResolvedValue('created');
    queryResult = { ...GAME, cross: null };

    render(app('/game/g1'));

    const dialog = await screen.findByRole('dialog', { name: 'Waiting for an opponent' });

    expect(within(dialog).getByText('g1')).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: /Copy invite link/ })).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: 'Cancel and leave' })).toBeTruthy();
});
```

Run: `npx vitest run src/pages/GamePage`
Expected: FAIL.

- [x] **Step 4: Згенеруй `dialog` і `drawer`**

```bash
npx shadcn@latest add dialog drawer -y
npm run lint:fix
```

- У `dialog.tsx` має бути проп `showCloseButton`. Якщо його немає, додай його: `showCloseButton = true`, а кнопку закриття рендер лише при `true`.
- Стилі контенту: `rounded-[22px] border-border bg-card p-8 sm:max-w-110`.
- Оверлей обох компонентів — той самий, що в alert-dialog (задача 3).
- `DrawerContent` — `rounded-t-3xl border-t border-border bg-card`; ручка зверху `h-1 w-10 bg-border`.

- [x] **Step 5: `BoardCell` і `Board`**

`BoardCell/BoardCell.tsx`:

```tsx
import type { FC } from 'react';

import Fade from '@/components/Fade';
import MarkIcon from '@/components/MarkIcon';
import cn from '@/lib/cn';
import type { Cell, Mark } from '@convex/rules';

type BoardCellProps = {
    index: number,
    value: Cell,
    win: Mark | null,
    locked: boolean,
    dim: boolean,
    onSelect: (index: number) => void
};

const label = (index: number, value: Cell) => `Row ${ Math.floor(index / 3) + 1 }, column ${ (index % 3) + 1 }: ${ value || 'empty' }`;

const BoardCell: FC<BoardCellProps> = ({ index, value, win, locked, dim, onSelect }) => (
    <button
        type="button"
        aria-label={ label(index, value) }
        data-win={ win ?? undefined }
        disabled={ locked || value !== '' }
        className={
            cn([
                'relative flex items-center justify-center rounded-2xl border-2 border-line bg-card transition-colors enabled:hover:border-border enabled:hover:bg-secondary disabled:cursor-default',
                'max-md:rounded-xl'
            ], {
                'bg-muted': dim && value === '',
                'border-circle bg-circle/16': win === 'circle',
                'border-cross bg-cross/16': win === 'cross'
            })
        }
        onClick={
            () => {
                onSelect(index);
            }
        }
    >
        <Fade
            show={ value !== '' }
            className="flex size-[58%] items-center justify-center"
        >
            { value && (
                <MarkIcon
                    mark={ value }
                    className="size-full"
                />
            ) }
        </Fade>
    </button>
);

export default BoardCell;
```

`Board/Board.tsx`:

```tsx
import type { FC } from 'react';

import BoardCell from '@/components/BoardCell';
import cn from '@/lib/cn';
import { canMove } from '@/lib/gameStatus';
import type { GameView } from '@/types/game';

type BoardProps = {
    game: GameView,
    onSelect: (index: number) => void
};

const Board: FC<BoardProps> = ({ game, onSelect }) => {
    const winner = game.result?.kind === 'win' ? game.result : null;
    const locked = !canMove(game);
    // Порожні клітинки темніші лише поки ходить суперник; після раунду поле має звичайний вигляд
    const dim = !game.result && game.turn !== game.me;

    return (
        <div
            className={
                cn([
                    'mx-auto grid aspect-square w-full max-w-120 grid-cols-3 gap-2',
                    'md:gap-2.5'
                ])
            }
        >
            { game.board.map((value, index) => (
                <BoardCell
                    key={ index }
                    index={ index }
                    value={ value }
                    win={ winner?.cells.includes(index) ? winner.mark : null }
                    locked={ locked }
                    dim={ dim }
                    onSelect={ onSelect }
                />
            )) }
        </div>
    );
};

export default Board;
```

- [x] **Step 6: `TurnStatus` і `PlayerCard`**

**`TurnStatus`** (`status: GameStatus`): `role="status"` у `FadeSwitch switchKey={ status.text }`. Плашка — `flex h-10 items-center gap-2.5 rounded-full border border-line bg-card px-4.5 font-medium`.
- Ліворуч: крапка `size-2.5 rounded-full` з кольором за `tone` (`bg-circle` / `bg-cross` / `bg-muted-foreground`), або при `waiting` — три крапки `size-1.5` з анімацією.
- Анімацію додай в `index.css`:

```css
@keyframes wait-dot {
    0%, 80%, 100% {
        opacity: 0.25;
    }

    40% {
        opacity: 1;
    }
}

@theme {
    --animate-wait-dot: wait-dot 1.4s ease-in-out infinite;
}
```

  Клас — `animate-wait-dot`, затримки — `[animation-delay:200ms]` і `[animation-delay:400ms]`, плюс `motion-reduce:animate-none`.
- Під плашкою `hint` (`text-sm text-muted-foreground text-center`).

**`PlayerCard`** — пропси `{ mark: Mark, player: PlayerView | null, isMe: boolean, active: boolean, activity: string | null }`. Картка `rounded-2xl border-2 bg-card p-3 md:p-4 flex items-center gap-2.5 md:gap-3.5`, рамка `border-circle` / `border-cross`, коли `active`, інакше `border-line`. Вміст:
- `UserAvatar tone={ mark } size` (`sm` на телефоні, `md` на десктопі — два елементи з `md:hidden` / `max-md:hidden`);
- ім'я: на телефоні `isMe ? 'You' : firstName(name)`, на десктопі повне ім'я і бейдж `YOU` (`rounded-md bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground` — 11px поза шкалою, тому в дужках);
- рядок `MarkIcon className="size-3.5"` + «Circle» / «Cross» + `activity` (`· your move` кольором `text-link` або `· thinking…`), лише на десктопі;
- рахунок `font-display text-3xl font-bold md:text-4xl` з `aria-label="Score"`.

Вільне місце (`player === null`): пунктирна картка `border-dashed border-border` з порожнім пунктирним кружечком і «Open seat».

- [x] **Step 7: `WaitingForOpponent`** (артборди `Waiting`, `MobileWaiting`)

```tsx
import { Link2, Share2 } from 'lucide-react';
import type { FC, ReactNode } from 'react';

import CopyButton from '@/components/CopyButton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import useLeaveGame from '@/hooks/useLeaveGame';
import useMediaQuery, { DESKTOP } from '@/hooks/useMediaQuery';
import { copyText, inviteLink, shareInvite } from '@/lib/invite';

const WaitDots: FC = () => (
    <span
        aria-hidden="true"
        className="flex gap-2"
    >
        <span className="size-3 animate-wait-dot rounded-full bg-circle motion-reduce:animate-none" />
        <span className="size-3 animate-wait-dot rounded-full bg-circle [animation-delay:200ms] motion-reduce:animate-none" />
        <span className="size-3 animate-wait-dot rounded-full bg-circle [animation-delay:400ms] motion-reduce:animate-none" />
    </span>
);

// Закрити можна лише через «Cancel and leave»: без суперника гра не почнеться
const WaitingForOpponent: FC<{ code: string }> = ({ code }) => {
    const isDesktop = useMediaQuery(DESKTOP);
    const leaveGame = useLeaveGame(code);

    const body: ReactNode = (
        <>
            <div className="flex gap-2">
                <p className="h-12 min-w-0 flex-1 truncate rounded-xl border border-border bg-field px-3.5 font-mono leading-12">{ code }</p>
                <CopyButton
                    text={ code }
                    label="Copy game ID"
                    success="Game ID copied"
                />
            </div>
            <div className="flex flex-col gap-2.5">
                { isDesktop
                    ? (
                        <Button
                            variant="secondary"
                            size="lg"
                            onClick={
                                () => {
                                    void copyText(inviteLink(code), 'Invite link copied');
                                }
                            }
                        >
                            <Link2 />
                            Copy invite link
                        </Button>
                    )
                    : (
                        <Button
                            size="lg"
                            onClick={
                                () => {
                                    void shareInvite(code);
                                }
                            }
                        >
                            <Share2 />
                            Share invite link
                        </Button>
                    ) }
                <Button
                    variant="ghost"
                    onClick={
                        () => {
                            void leaveGame('lobby');
                        }
                    }
                >
                    Cancel and leave
                </Button>
            </div>
        </>
    );

    if (isDesktop) {
        return (
            <Dialog open>
                <DialogContent
                    showCloseButton={ false }
                    className="flex flex-col gap-6"
                    onEscapeKeyDown={
                        event => {
                            event.preventDefault();
                        }
                    }
                    onInteractOutside={
                        event => {
                            event.preventDefault();
                        }
                    }
                >
                    <WaitDots />
                    <div className="flex flex-col gap-2.5">
                        <DialogTitle className="font-display text-3xl font-bold tracking-tight">Waiting for an opponent</DialogTitle>
                        <DialogDescription>Send this game ID to a friend. The game starts as soon as they join.</DialogDescription>
                    </div>
                    { body }
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer
            open
            dismissible={ false }
        >
            <DrawerContent className="flex flex-col gap-5 px-5 pb-9">
                <WaitDots />
                <div className="flex flex-col gap-2">
                    <DrawerTitle className="font-display text-2xl font-extrabold tracking-tight">Waiting for an opponent</DrawerTitle>
                    <DrawerDescription>Share the invite link. The game starts as soon as your friend joins.</DrawerDescription>
                </div>
                { body }
            </DrawerContent>
        </Drawer>
    );
};

export default WaitingForOpponent;
```

- [x] **Step 8: `GamePage`** (артборди `Game`, `GameOpponent`, `MobilePlay`, `MobileOpponent`, `MobileGame`)

Логіка лишається: ефекти `enter` і `wasInGame` з `ENTER_TOAST`, `onSelect` з `isMoving`. Змінюються лише імпорти toast (вже sonner) і рендер:

```tsx
if (!game) {
    return <Spinner />;
}

const status = gameStatus(game);
const activityOf = (mark: Mark) => {
    if (game.result || game.turn !== mark) {
        return null;
    }

    return mark === game.me ? '· your move' : '· thinking…';
};

return (
    <>
        { (!game.circle || !game.cross) && <WaitingForOpponent code={ game.code } /> }
        <div
            className={
                cn([
                    'grid w-full gap-5',
                    'md:grid-cols-[minmax(0,32.5rem)_minmax(0,23.75rem)] md:justify-center md:gap-x-10 md:gap-y-3'
                ])
            }
        >
            <section
                aria-label="Players"
                className={
                    cn([
                        'grid grid-cols-2 gap-2.5',
                        'md:col-start-2 md:row-start-1 md:grid-cols-1 md:gap-3'
                    ])
                }
            >
                <h2 className="text-xs font-medium tracking-widest text-muted-foreground uppercase max-md:hidden">Session score</h2>
                { ([ 'circle', 'cross' ] as const).map(mark => (
                    <PlayerCard
                        key={ mark }
                        mark={ mark }
                        player={ game[ mark ] }
                        isMe={ mark === game.me }
                        active={ game.result?.kind === 'win' ? game.result.mark === mark : !game.result && game.turn === mark }
                        activity={ activityOf(mark) }
                    />
                )) }
            </section>
            <section
                aria-label="Board"
                className={
                    cn([
                        'flex flex-col items-center gap-4',
                        'md:col-start-1 md:row-span-2 md:row-start-1 md:gap-5'
                    ])
                }
            >
                <TurnStatus status={ status } />
                <Board
                    game={ game }
                    onSelect={ onSelect }
                />
            </section>
            <section
                className={
                    cn([
                        'grid grid-cols-2 gap-2.5',
                        'md:col-start-2 md:row-start-2 md:self-start'
                    ])
                }
            >
                <Button
                    variant="secondary"
                    size="lg"
                    onClick={
                        () => {
                            clearBoard({ code: gameId }).catch(onError);
                        }
                    }
                >
                    <RotateCcw />
                    Clear
                    <span className="max-md:hidden">board</span>
                </Button>
                <Button
                    variant="secondary"
                    size="lg"
                    onClick={
                        () => {
                            newSession({ code: gameId }).catch(onError);
                        }
                    }
                >
                    <Plus />
                    New session
                </Button>
                <p className="col-span-2 text-sm text-muted-foreground max-md:hidden">Clear board keeps the score. New session resets it to 0 : 0.</p>
            </section>
        </div>
    </>
);
```

Потім видали теки `Button`, `Cell` (разом із `winLine.ts` і `winLine.test.ts`), `Player`, `Statistics`, `Waiting`.

Run: `npx vitest run src/pages/GamePage && npm run test:once`
Expected: PASS.

- [x] **Step 9: Перевірка в браузері (Claude, Playwright MCP)**

Повний сценарій двох гравців автоматизує задача 9. Тут Claude звіряє вигляд.

Два гравці потрібні в різних сховищах браузера. Запусти фронт з `npm run dev -- --host`: перший гравець відкриває `http://localhost:5173`, другий — `http://127.0.0.1:5173`. Це різні origin, тож у них різні сесії. Обидва — тестові користувачі `@e2e.test`.

1. Перший створює гру. Діалог «Waiting for an opponent» на 1280px звір з `docs/design/Waiting.dc.html`, нижню панель на 390px — з `docs/design/MobileWaiting.dc.html`.
2. Другий приєднується. Екран першого (його хід) звір з `docs/design/Game.dc.html` і `docs/design/MobilePlay.dc.html`, екран другого (чекає) — з `docs/design/GameOpponent.dc.html` і `docs/design/MobileOpponent.dc.html`.
3. Виграний раунд на 390px звір з `docs/design/MobileGame.dc.html`: підсвічені клітинки, плашка «You take the round».

Наприкінці — `npx convex run testing:deleteE2eUsers`.

- [x] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: redesigned game screen with turn status and waiting sheet

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: E2E-тести на Playwright

**Files:**
- Create: `playwright.config.ts`, `e2e/helpers.ts`, `e2e/auth.spec.ts`, `e2e/game.spec.ts`, `e2e/teardown.ts`
- Modify: `package.json`, `.gitignore`, `tsconfig.node.json`, `eslint.config.mjs`

**Interfaces:**
- Consumes:
  - сторінки й тексти задач 3–8: `Create account`, `Sign in`, `Ready for a round, <ім'я>?`, `Waiting for an opponent`, `Your turn`, `<ім'я>'s turn`, `You take the round`, `<ім'я> takes the round`, `Draw. Nobody takes this one`, `Back to lobby`, `Leave game`, `Open menu`;
  - aria-label клітинок `Row R, column C: circle|cross|empty` і `data-win`;
  - тексти помилок з `convex/authRules.ts`;
  - `internal.testing.deleteE2eUsers`.
- Produces:
  - `npm run test:e2e` — усі сценарії в проєктах `desktop` (1280×860) і `phone` (390×844);
  - змінні середовища: `E2E_BASE_URL` (інша адреса замість локального `npm run dev`) і `E2E_PROD=1` (прибирати на prod).

Тести йдуть проти `npm run dev` і dev-деплойменту Convex, тож `npx convex dev` має бути запущений. Сценаріїв, яких тут немає: входу через Google (справжній вхід Google не автоматизується) і системного меню «Поділитися».

- [x] **Step 1: Встанови Playwright**

```bash
npm i -D @playwright/test
npx playwright install chromium
```

У `package.json` додай скрипт `"test:e2e": "playwright test"`. У `.gitignore` додай `playwright-report/` і `test-results/`.

- [x] **Step 2: `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:5173';

// Один воркер: обидва проєкти ходять в один dev-деплоймент Convex
export default defineConfig({
    testDir: 'e2e',
    workers: 1,
    use: {
        baseURL,
        trace: 'retain-on-failure'
    },
    projects: [
        {
            name: 'desktop',
            use: { ...devices[ 'Desktop Chrome' ], viewport: { width: 1280, height: 860 } }
        },
        {
            name: 'phone',
            use: { ...devices[ 'Pixel 7' ], viewport: { width: 390, height: 844 } }
        }
    ],
    webServer: process.env.E2E_BASE_URL
        ? undefined
        : { command: 'npm run dev', url: baseURL, reuseExistingServer: true },
    globalTeardown: './e2e/teardown.ts'
});
```

- [x] **Step 3: TypeScript і ESLint для `e2e/`**

- У `tsconfig.node.json` у `include` додай `"playwright.config.ts"` і `"e2e"`.
- В `eslint.config.mjs` у `projectService.allowDefaultProject` додай `'playwright.config.ts'` і `'e2e/*.ts'`. Файлів разом із конфігами Vite/Vitest буде 7, а ліміт typescript-eslint за замовчуванням — 8.

Run: `npm run typecheck && npm run lint`
Expected: PASS.

- [x] **Step 4: Прибирання й хелпери**

`e2e/teardown.ts`:

```ts
import { execFileSync } from 'node:child_process';

// Після всіх тестів прибираємо користувачів @e2e.test; E2E_PROD=1 — коли тести йшли проти prod
export default () => {
    const prod = process.env.E2E_PROD === '1' ? [ '--prod' ] : [];

    execFileSync('npx', [ 'convex', 'run', ...prod, 'testing:deleteE2eUsers' ], { stdio: 'inherit' });
};
```

`e2e/helpers.ts`:

```ts
import { type Browser, expect, type Page, test } from '@playwright/test';

export const PASSWORD = 'tictac2026';

const suffix = () => `${ Date.now() }-${ Math.random().toString(36).slice(2, 7) }`;

export const testEmail = (label: string) => `e2e-${ label }-${ suffix() }@e2e.test`;

export const isPhone = () => test.info().project.name === 'phone';

export const cell = (page: Page, row: number, column: number) => page.getByRole('button', {
    name: new RegExp(`^Row ${ row }, column ${ column }:`)
});

// Окремий контекст — окреме сховище, тобто другий гравець з власною сесією
export const newPlayerPage = async (browser: Browser) => {
    const { baseURL, viewport, userAgent, isMobile, hasTouch, deviceScaleFactor } = test.info().project.use;
    const context = await browser.newContext({ baseURL, viewport, userAgent, isMobile, hasTouch, deviceScaleFactor });

    return context.newPage();
};

export const fillSignUp = async (page: Page, name: string, email: string) => {
    await page.getByLabel('Name').fill(name);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Create account' }).click();
};

export const signUp = async (page: Page, name: string, email = testEmail(name.toLowerCase())) => {
    await page.goto('/signup');
    await fillSignUp(page, name, email);
    await expect(page.getByRole('heading', { name: `Ready for a round, ${ name }?` })).toBeVisible();

    return email;
};

// Десктоп — дропдаун з ім'ям, телефон — бургер-меню
export const chooseMenuItem = async (page: Page, name: string, item: string) => {
    if (isPhone()) {
        await page.getByRole('button', { name: 'Open menu' }).click();
        await page.getByRole('dialog').getByRole('button', { name: item }).click();

        return;
    }

    await page.getByRole('button', { name: new RegExp(name) }).click();
    await page.getByRole('menuitem', { name: item }).click();
};
```

Пароль шукається з `{ exact: true }`, бо в поля є ще кнопка «Show password».

- [x] **Step 5: `e2e/auth.spec.ts`**

```ts
import { expect, type Page, test } from '@playwright/test';

import { EMAIL_TAKEN, WRONG_CREDENTIALS } from '../convex/authRules';

import { chooseMenuItem, fillSignUp, PASSWORD, signUp, testEmail } from './helpers';

const signIn = async (page: Page, email: string, password: string) => {
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
};

test('sign up, sign out and sign in again', async ({ page }) => {
    const email = await signUp(page, 'Alice');

    await chooseMenuItem(page, 'Alice', 'Sign out');
    await expect(page).toHaveURL(/\/login$/);

    await signIn(page, email, PASSWORD);
    await expect(page.getByRole('heading', { name: 'Ready for a round, Alice?' })).toBeVisible();
});

test('a wrong password is refused', async ({ page }) => {
    const email = await signUp(page, 'Alice');

    await chooseMenuItem(page, 'Alice', 'Sign out');
    await signIn(page, email, 'wrong-pass-1');

    await expect(page.getByText(WRONG_CREDENTIALS)).toBeVisible();
});

// Review Focus 1
test('an email can be registered only once', async ({ page }) => {
    const email = await signUp(page, 'Alice');

    await chooseMenuItem(page, 'Alice', 'Sign out');
    await page.goto('/signup');
    await fillSignUp(page, 'Alice', email);

    await expect(page.getByText(EMAIL_TAKEN)).toBeVisible();
});

// Review Focus 3
test('a game link survives sign-up', async ({ page }) => {
    const code = `e2e-${ Date.now() }`;

    await page.goto(`/game/${ code }?mark=circle`);
    await expect(page).toHaveURL(/\/login$/);

    await page.getByRole('link', { name: 'Create an account' }).click();
    await fillSignUp(page, 'Alice', testEmail('link'));

    await expect(page).toHaveURL(new RegExp(`/game/${ code }$`));
    await expect(page.getByText('Waiting for an opponent')).toBeVisible();
});
```


- [x] **Step 6: `e2e/game.spec.ts`**

```ts
import { expect, test } from '@playwright/test';

import { cell, chooseMenuItem, newPlayerPage, signUp } from './helpers';

test('two players join through the lobby, win a round, draw one and leave', async ({ page, browser }) => {
    const bob = await newPlayerPage(browser);

    await signUp(page, 'Alice');
    await signUp(bob, 'Bob');

    // Alice створює гру з лобі; ID беремо з адреси, куди її перекинуло
    await page.getByRole('button', { name: /Create game/ }).click();
    await expect(page.getByText('Waiting for an opponent')).toBeVisible();

    const code = decodeURIComponent(new URL(page.url()).pathname.split('/').pop() ?? '');

    await bob.getByRole('tab', { name: 'Join a game' }).click();
    await bob.getByLabel('Game ID').fill(code);
    await bob.getByRole('button', { name: /Join game/ }).click();

    await expect(page.getByText('Waiting for an opponent')).toBeHidden();
    await expect(page.getByText('Your turn')).toBeVisible();
    await expect(bob.getByText('Alice\'s turn')).toBeVisible();
    await expect(cell(bob, 2, 2)).toBeDisabled();

    // Виграш Alice першим рядком
    await cell(page, 1, 1).click();
    await cell(bob, 2, 1).click();
    await cell(page, 1, 2).click();
    await cell(bob, 2, 2).click();
    await cell(page, 1, 3).click();

    await expect(page.getByText('You take the round')).toBeVisible();
    await expect(bob.getByText('Alice takes the round')).toBeVisible();
    await expect(cell(page, 1, 1)).toHaveAttribute('data-win', 'circle');

    // Після паузи поле очищається, і нолик знову ходить першим
    await expect(cell(page, 1, 1)).toHaveAccessibleName(/empty$/);
    await expect(page.getByText('Your turn')).toBeVisible();

    // Нічия: O X O / O X X / X O O
    for (const [ player, row, column ] of [
        [ page, 1, 1 ], [ bob, 1, 2 ], [ page, 1, 3 ], [ bob, 2, 2 ], [ page, 2, 1 ],
        [ bob, 3, 1 ], [ page, 3, 2 ], [ bob, 2, 3 ], [ page, 3, 3 ]
    ] as const) {
        await cell(player, row, column).click();
    }

    await expect(page.getByText('Draw. Nobody takes this one')).toBeVisible();

    // Bob іде в лобі — у Alice знову очікування суперника
    await chooseMenuItem(bob, 'Bob', 'Back to lobby');
    await bob.getByRole('alertdialog').getByRole('button', { name: 'Leave game' }).click();

    await expect(bob.getByRole('heading', { name: 'Ready for a round, Bob?' })).toBeVisible();
    await expect(page.getByText('Waiting for an opponent')).toBeVisible();

    await bob.context().close();
});
```

Клітинка суперника стає активною лише після того, як дійде його черга. `click()` у Playwright сам чекає, поки кнопка стане enabled, тож затримки між ходами не потрібні.

- [x] **Step 7: Прожени**

`npx convex dev` запущений у фоні. Далі:

Run: `npm run test:e2e`
Expected: усі тести зелені в обох проєктах; у кінці teardown друкує кількість видалених тестових користувачів.

Якщо тест падає, відкрий трейс (`npx playwright show-trace test-results/…/trace.zip`). Виправ причину в коді застосунку, а не підганяй тест під помилку.

- [x] **Step 8: Commit**

```bash
git add -A
git commit -m "test: end-to-end sign-up, sign-in and two-player game with Playwright

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Прибирання, документація, перевірка на prod

**Files:**
- Modify: `src/index.css`, `README.md`, `CLAUDE.md`, `package.json`, `docs/superpowers/plans/2026-10-15-redesign-email-auth.md`
- Delete: `src/assets/not-avatar.jpg` і все, що лишилось невикористаним

- [x] **Step 1: Прибери legacy**

- З `src/index.css` видали блок `/* Legacy … */`.
- Перевір, що нічого не посилається на старі класи, файли й пакети:

```bash
grep -rnE "blue-dark|bg-red|border-green|text-green|bg-blue-50|stone-300|not-avatar|react-hot-toast|react-loader-spinner|root-modal" src index.html vitest.config.ts
```

  Expected: порожньо.
- Видали `src/assets/not-avatar.jpg` і теку `src/assets`, якщо вона спорожніла.

- [x] **Step 2: Ревізія формату**

Прожени сканери зі скіла `.claude/skills/tailwind-format/` по всьому `src` і виправ знахідки.

Run: `npm run lint:fix && npm run typecheck && npm run test:once && npm run build`
Expected: усе зелене.

- [x] **Step 3: Документація**

- **`README.md`:** вхід — Google або пошта з паролем (без підтвердження пошти). Команда `npm run test:e2e` (потрібен запущений `npx convex dev`).
- **`CLAUDE.md`:**
  - **Стек:** додай shadcn/ui (`src/components/ui`, правляться як свій код і за тими самими правилами форматування), `lucide-react`, `sonner`, `react-hook-form` + `zod`.
  - **Бекенд:** вхід поштою — власний провайдер `convex/emailPassword.ts` (`id: 'password'`); помилки для людини лише як `ConvexError`.
  - **Конвенції:** дизайн — канвас https://claude.ai/artifact/PDTUiw8QMxFx1aLJRnp4US, копія в `docs/design/`; кольори лише через токени в `src/index.css`.
  - **Команди:** `npm run test:e2e` — Playwright, проти `npm run dev` і dev-деплойменту; тестові користувачі лише `@e2e.test`, прибирання — `npx convex run testing:deleteE2eUsers`.
  - **Поточна робота:** прибери розділ або заміни на «Підтвердження пошти й скидання пароля — розділ «Пізніше» в плані 2026-10-15».
  - **Історія:** «Редизайн і вхід поштою — жовтень 2026, план `docs/superpowers/plans/2026-10-15-redesign-email-auth.md`».

- [ ] **Step 4: Фінальна перевірка**

1. **Автоматично:** `npm run test:once && npm run test:e2e` — усе зелене.
2. **Claude, Playwright MCP:**
   - кожен екран на 1280px і 390px ще раз звірити з `docs/design/`;
   - клавіатура: Tab проходить усі кнопки й поля, Esc закриває меню й діалог виходу, але не діалог очікування.
3. **👤 Власник, на `npm run dev`:**
   - вхід через Google з прямого посилання `/game/:id` → назад у гру;
   - на телефоні (або в емуляції з Web Share) «Share invite link» відкриває системне меню, а скасування не показує помилки (Review Focus 4).

- [x] **Step 5: Commit і передача власнику**

```bash
git add -A
git commit -m "chore: drop legacy styles, document email sign-in and the redesign

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Відміть усі кроки плану як виконані й скажи власнику, що гілку можна пушити: Netlify після мерджу в `main` сам розгорне Convex prod і фронт. Нових змінних середовища на prod не потрібно.

- [ ] **Step 6: Перевірка на prod після деплою**

Сценарії входу можна прогнати проти prod. Це створює й одразу видаляє тестових користувачів `@e2e.test` у Production, тож запускати лише з дозволу власника:

```bash
E2E_BASE_URL=https://bogkas-tic-tac-toe.netlify.app E2E_PROD=1 npx playwright test e2e/auth.spec.ts --project=desktop
```

Головне, що тут перевіряється (Review Focus 1): `ConvexError` з провайдера доходить до клієнта на prod. Повторна реєстрація має показати «An account with this email already exists. Sign in instead», а не «Could not create the account. Try again».

Якщо власник не хоче запускати тести на prod, він перевіряє вручну: реєструється поштою, пробує ще раз на ту саму адресу, потім видаляє тестового користувача (`npx convex run --prod testing:deleteE2eUsers`, якщо пошта на `@e2e.test`, або в дашборді Convex → Production).

---

## Пізніше: підтвердження пошти й скидання пароля

Екрани вже є на канвасі: `VerifyEmail`, `ResetPassword`, `MobileVerifyEmail`, `MobileResetPassword`. Повні кроки з кодом і тестами — у першій версії цього плану:

```bash
git show 5a16c71:docs/superpowers/plans/2026-10-15-redesign-email-auth.md
```

Там задача 2 (Resend і `convex/otp.ts`), задача 5 (екран коду) і задача 6 (скидання пароля). Що врахувати при поверненні:

1. **👤 Resend.**
   - Акаунт і ключ `AUTH_RESEND_KEY` у Convex dev і prod.
   - Для листів усім гравцям — підтверджений домен і `AUTH_EMAIL_FROM`.
2. **Бекенд.**
   - `convex/otp.ts` з першої версії: `generateCode`, `sendCodeEmail`, `ResendOTP`, `ResendOTPPasswordReset`. Код із 6 цифр, діє 15 хв.
   - У `EmailPassword` для непідтвердженої пошти викликати `signInViaProvider(ctx, ResendOTP, { accountId, params })` — так робить штатний `Password` (`node_modules/@convex-dev/auth/dist/providers/Password.js`, гілки `email-verification`, `reset`, `reset-verification`).
   - Перевірку зайнятої пошти зберегти. З перевіркою пошти Convex Auth з'єднує акаунти з однаковою підтвердженою адресою, тож гілку `google` у `takenEmailMessage` варто переглянути.
   - Наявні акаунти без підтвердженої пошти при наступному вході отримають код — міграція не потрібна.
3. **Фронт.**
   - Екран коду (`input-otp`), пам'ять незавершеного входу для «Resend code», екран скидання пароля, лінк «Forgot password?».
   - Гілка `signingIn: false` у `SignInPage` / `SignUpPage` → `/verify`.
4. **Review Focus з першої версії:**
   - вхід у непідтверджений акаунт веде на код;
   - перезавантаження на `/verify` пояснює, що сесія минула;
   - `from` переживає `/signup → /verify`.
