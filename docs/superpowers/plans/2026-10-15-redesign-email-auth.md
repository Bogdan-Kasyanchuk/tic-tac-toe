# Редизайн tic-tac-toe і вхід поштою — план реалізації

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** перенести в код новий дизайн з канвасу (темна тема, shadcn/ui, десктоп і телефон) і додати вхід поштою з паролем: реєстрацію, підтвердження пошти кодом із 6 цифр і скидання пароля.

**Architecture:** логіка гри на Convex не змінюється. Бекенд отримує провайдер `Password` з Convex Auth: коди з 6 цифр генерує й надсилає через Resend невеликий модуль `convex/otp.ts`. Фронт переходить на компоненти shadcn/ui (Radix + Tailwind 4) з токенами теми в `src/index.css`. Сторінки входу живуть окремо від застосунку з шапкою; для `/` і `/game/:id` є спільний layout. На ширині від `md` (48rem) показуються дропдаун і модальні діалоги, на телефоні — бургер-меню (Sheet) і нижня панель (Drawer).

**Tech Stack:** Vite 8, React 19, TypeScript 6, Tailwind CSS 4.3, React Router 8, Convex 1.46 + `@convex-dev/auth` 0.0.96 (`Password`, `@auth/core/providers/resend`), shadcn/ui (Radix), `lucide-react`, `sonner`, `vaul` (Drawer), `input-otp`, `react-hook-form` + `zod` 4 + `@hookform/resolvers`, `@fontsource-variable/{geist,geist-mono,bricolage-grotesque}`, `motion`, Vitest 5 + Testing Library + `@testing-library/user-event`, `convex-test`.

**Виконання:** Native (обрано власником 2026-10-15): усі задачі по черзі в одній сесії, наприкінці одна рецензія всієї гілки. Стан на 2026-10-15 — ще не розпочато, починати із задачі 1. Галочки `- [x]` у кроках показують, що вже зроблено.

**Spec:** дизайн — канвас https://claude.ai/artifact/PDTUiw8QMxFx1aLJRnp4US (екрани `*.dc.html`; точні кольори, відступи й тексти беруться з нього). Рішення з розмови зведені в розділ «Рішення».

## Рішення

- Дизайн — канвас вище. Він розбитий на ряди: «Auth · desktop», «Auth · phone», «Play · desktop», «Play · phone» і аркуш «Components (shadcn/ui)».
- Бібліотека компонентів — shadcn/ui на Radix. Файли компонентів генеруються в `src/components/ui/` і далі вважаються кодом проєкту, а не залежністю.
- Тема тільки темна, світлої немає.
- Вхід:
  - Google, як зараз;
  - пошта з паролем: реєстрація → код із 6 цифр на пошту → вхід;
  - вхід у ще не підтверджений акаунт теж надсилає код і веде на екран підтвердження;
  - скидання пароля у два кроки: пошта → код + новий пароль;
  - мінімальна довжина пароля — 8 символів, код діє 15 хвилин.
- Листи надсилає Resend через `fetch` до його API, без SDK. Поки немає власного домену, відправник — `onboarding@resend.dev`, і листи доходять лише на пошту власника акаунта Resend. Адресу відправника змінює змінна `AUTH_EMAIL_FROM`.
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
- Константи коду й пароля живуть у `convex/authRules.ts`; фронт імпортує їх через `@convex/authRules`. `convex/otp.ts` на фронт не імпортується, бо тягне `@auth/core`:
  - код — 6 цифр, діє 15 хв;
  - пароль — мінімум 8 символів;
  - повторне надсилання коду — не раніше ніж через 60 с.
- **Конвекс приховує на prod повідомлення звичайних `Error`.** Тож будь-яке зіставлення тексту помилки на клієнті — лише підказка. Завжди має бути зрозумілий запасний текст для кожного сценарію.
- Секрети (`AUTH_RESEND_KEY`) і логіни в Resend, Convex, Netlify робить власник (👤). Claude лише каже, що зробити. Пушить на GitHub теж власник.
- Кожен коміт закінчується рядком `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Після кожної задачі: `npm run lint:fix && npm run typecheck && npm run test:once` — усе зелене.

## Review Focus

1. **Вхід у ще не підтверджений акаунт.** Людина, що зареєструвалась і не ввела код, пробує увійти. Вона має опинитися на екрані «Check your email» зі свіжим кодом, а не побачити «Wrong email or password». Тест — задача 4.
2. **Екран підтвердження після перезавантаження.** Пам'ять із поштою й паролем порожня. Сторінка має пояснити, що сесія входу минула, і дати посилання назад, а не викликати `signIn` з `undefined`. Тест — задача 5.
3. **Пряме посилання на гру → реєстрація → код.** Після підтвердження людина повертається на `/game/:id`, тобто `from` переживає весь ланцюжок `/login → /signup → /verify`. Тести — задачі 4 і 5.
4. **Скасоване меню «Поділитися» на телефоні** (`AbortError`): без toast-а про помилку й без копіювання. На десктопі без `navigator.share` лінк копіюється. Тест — задача 3.
5. **Клік по логотипу посеред гри.** Має з'явитися підтвердження, а не тихий перехід у лобі, після якого місце в грі лишається зайнятим. Тест — задача 3.

---

## Відповідність канвасу й коду

| Артборд | Де в коді |
|---|---|
| `Main`, `MobileSignIn` | `src/pages/SignInPage` (`/login`) |
| `SignUp`, `MobileSignUp` | `src/pages/SignUpPage` (`/signup`) |
| `VerifyEmail`, `MobileVerifyEmail` | `src/pages/VerifyEmailPage` (`/verify`) |
| `ResetPassword`, `MobileResetPassword` | `src/pages/ResetPasswordPage` (`/reset`) |
| `Lobby`, `LobbyJoin`, `MobileLobby`, `MobileLobbyJoin` | `src/pages/HomePage` (`/`, вкладки New / Join) |
| `Waiting`, `MobileWaiting` | `src/components/WaitingForOpponent` |
| `Game`, `GameOpponent`, `MobilePlay`, `MobileOpponent`, `MobileGame` | `src/pages/GamePage` + `Board`, `PlayerCard`, `TurnStatus` |
| дропдаун на `Lobby` / `GameOpponent` | `src/components/AccountMenu` |
| `MobileMenu` | `src/components/MobileMenu` |
| `Components` | `src/components/ui/*` + токени в `src/index.css` |

Щоб звірити екран, відкрий канвас або прочитай файл артборду (`Artifact` → `read`, `path: "project/<Ім'я>.dc.html"`).

## Структура файлів після редизайну

```
convex/
├─ auth.ts                 + Password({ profile, validatePasswordRequirements, verify, reset })
├─ authRules.ts / .test.ts  MIN_PASSWORD_LENGTH, CODE_LENGTH, CODE_TTL_SECONDS, RESEND_AFTER_SECONDS, normalizeEmail, validatePassword
├─ otp.ts / otp.test.ts    generateCode, sendCodeEmail, ResendOTP, ResendOTPPasswordReset
├─ users.ts / users.test.ts      me → { name, email, avatar }
└─ test.setup.ts           asUser додає email
src/
├─ index.css               токени теми, шрифти, base
├─ App.tsx                 маршрути: auth окремо, AppLayout для / і /game/:id
├─ auth/                   PendingAuthProvider, pendingAuthContext, usePendingAuth
├─ hooks/                  useMediaQuery, useFrom, useLeaveGame
├─ lib/                    cn (+ named), invite, authError, gameStatus, passwordStrength, initials
├─ test/                   setup.ts (поліфіли jsdom), viewport.ts (mockViewport)
├─ components/
│  ├─ ui/                  shadcn: button input label sonner input-otp dropdown-menu sheet alert-dialog avatar dialog drawer tabs
│  ├─ Logo  UserAvatar  CopyButton  FieldError  PasswordInput  OrDivider  GoogleButton  HeroBoard
│  ├─ AuthSplitLayout  AuthCardLayout  AppLayout  AppHeader  AccountMenu  MobileMenu  LeaveGameDialog
│  ├─ MarkIcon  MarkPicker  Board  BoardCell  PlayerCard  TurnStatus  WaitingForOpponent
│  └─ Fade  FadeSwitch  Spinner     (лишаються; Spinner переписаний)
└─ pages/  SignInPage  SignUpPage  VerifyEmailPage  ResetPasswordPage  HomePage  GamePage
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

- [ ] **Step 1: Встанови залежності**

```bash
npm i lucide-react sonner @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/bricolage-grotesque
npm i -D @testing-library/user-event
```

- [ ] **Step 2: Додай іменований `cn`**

`src/lib/cn.ts`:

```ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Іменований експорт потрібен файлам shadcn/ui: вони імпортують `{ cn }` з аліасу utils
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export default cn;
```

- [ ] **Step 3: Створи `components.json`**

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

- [ ] **Step 4: Перепиши токени в `src/index.css`**

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

/* Legacy: тримає старі HomePage/GamePage до задач 7–8, видаляється в задачі 9 */
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

- [ ] **Step 5: Згенеруй базові компоненти shadcn**

```bash
npx shadcn@latest add button input label sonner -y
```

Якщо CLI пропонує переписати `src/index.css` або `cn.ts`, відмовся: токени вже стоять. Потім:
- `npm uninstall next-themes`: sonner від shadcn тягне його, нам теми не потрібні.

- [ ] **Step 6: Підлаштуй `button.tsx` під канвас**

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

- [ ] **Step 7: Підлаштуй `input.tsx`, `label.tsx`, `sonner.tsx`**

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

- [ ] **Step 8: Переведи toast-и на sonner**

Скрізь у `src`:
- `import toast from 'react-hot-toast'` → `import { toast } from 'sonner'`;
- `import { Toaster } from 'react-hot-toast'` → `import { Toaster } from '@/components/ui/sonner'`.

В `App.tsx` замість `<Toaster position="top-right" />` став `<Toaster />`. API сумісний: `toast.success(text, { id })`, `toast.error(text, { id })`. Потім видали залежність:

```bash
npm uninstall react-hot-toast
```

- [ ] **Step 9: Тестове середовище jsdom**

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

- [ ] **Step 10: ESLint для `src/components/ui`**

`button.tsx` експортує `buttonVariants` поруч із компонентом, через що спрацьовує правило `react-refresh/only-export-components`. Додай в `eslint.config.mjs` окремий блок:

```js
{
    files: [ 'src/components/ui/**/*.tsx' ],
    rules: {
        'react-refresh/only-export-components': 'off'
    }
},
```

- [ ] **Step 11: `index.html`**

Прибери три рядки Google Fonts (`preconnect` ×2 і `css2?family=Open+Sans`) і зміни `theme-color` на `#0d0f1f`. `<div id="root-modal">` поки лишається: на нього спирається старий `Modal`, обидва видаляються в задачі 3.

- [ ] **Step 12: Перевір**

Run: `npm run lint:fix && npm run typecheck && npm run test:once && npm run build`
Expected: усе зелене. Старі сторінки тимчасово темні з чорним текстом. Це нормально, їх замінять задачі 3–8.

Прожени сканери скіла `tailwind-format` по `src/components/ui/*.tsx` і виправ групування класів, якщо вони щось знайдуть.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: dark theme tokens, shadcn/ui base components and sonner

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Бекенд — вхід поштою з паролем і коди з 6 цифр

**Files:**
- Create: `convex/authRules.ts`, `convex/authRules.test.ts`, `convex/otp.ts`, `convex/otp.test.ts`
- Modify: `convex/auth.ts`, `convex/users.ts`, `convex/users.test.ts`, `convex/test.setup.ts`

**Interfaces:**
- Produces:
  - з `convex/authRules.ts`: `MIN_PASSWORD_LENGTH = 8`, `CODE_LENGTH = 6`, `CODE_TTL_SECONDS = 900`, `RESEND_AFTER_SECONDS = 60`, `normalizeEmail(value: unknown): string`, `validatePassword(password: string): void`;
  - з `convex/otp.ts`: `generateCode(random?: (bytes: Uint32Array) => Uint32Array): string`;
  - `sendCodeEmail(email: CodeEmail): Promise<void>`;
  - `ResendOTP`, `ResendOTPPasswordReset`;
  - `api.users.me` → `{ name: string, email: string, avatar: string } | null`.
- Провайдер з `id: 'password'` приймає `signIn('password', params)` з `flow`: `signIn | signUp | email-verification | reset | reset-verification`.

- [ ] **Step 1: 👤 Ключ Resend для dev**

Власник:
1. Реєструється на resend.com.
2. Відкриває API Keys → Create API key (права Sending access).
3. Виконує в теці проєкту:

```bash
npx convex env set AUTH_RESEND_KEY <ключ>
```

Ключ у чат не вставляти. Для prod той самий крок з `--prod` — у задачі 9.

- [ ] **Step 2: Тест правил пароля (падає)**

`convex/authRules.test.ts`:

```ts
import { expect, test } from 'vitest';

import { MIN_PASSWORD_LENGTH, normalizeEmail, validatePassword } from './authRules';

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
```

Run: `npx vitest run convex/authRules.test.ts`
Expected: FAIL, бо модуля `./authRules` ще немає.

- [ ] **Step 3: Реалізуй `convex/authRules.ts`**

```ts
import { ConvexError } from 'convex/values';

export const MIN_PASSWORD_LENGTH = 8;
export const CODE_LENGTH = 6;
export const CODE_TTL_SECONDS = 15 * 60;
export const RESEND_AFTER_SECONDS = 60;

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
```

Run: `npx vitest run convex/authRules.test.ts`
Expected: PASS.

- [ ] **Step 4: Тест кодів і листа (падає)**

`convex/otp.test.ts`:

```ts
import { afterEach, expect, test, vi } from 'vitest';

import { CODE_LENGTH } from './authRules';
import { generateCode, sendCodeEmail } from './otp';

afterEach(() => {
    vi.unstubAllGlobals();
});

test('codes are six digits', () => {
    const code = generateCode();

    expect(code).toMatch(/^\d{6}$/);
    expect(code).toHaveLength(CODE_LENGTH);
});

test('each digit comes from the random source', () => {
    const random = (bytes: Uint32Array) => {
        bytes.set([ 10, 11, 12, 13, 14, 19 ]);

        return bytes;
    };

    expect(generateCode(random)).toBe('012349');
});

test('the code email goes to Resend with the code in the text', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));

    vi.stubGlobal('fetch', fetchMock);

    await sendCodeEmail({ apiKey: 'key', from: 'App <a@b.c>', to: 'alice@example.com', subject: 'Code', code: '123456' });

    const [ url, init ] = fetchMock.mock.calls[ 0 ];

    expect(url).toBe('https://api.resend.com/emails');
    expect(init.headers.Authorization).toBe('Bearer key');
    expect(JSON.parse(init.body)).toMatchObject({ from: 'App <a@b.c>', to: [ 'alice@example.com' ], subject: 'Code' });
    expect(JSON.parse(init.body).text).toContain('123456');
});

test('a rejected email surfaces as an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 403 })));

    await expect(sendCodeEmail({ apiKey: 'key', from: 'a@b.c', to: 'x@y.z', subject: 'Code', code: '1' }))
        .rejects.toThrow('Could not send the email (403)');
});
```

Run: `npx vitest run convex/otp.test.ts`
Expected: FAIL, бо модуля `./otp` ще немає.

- [ ] **Step 5: Реалізуй `convex/otp.ts`**

```ts
import Resend from '@auth/core/providers/resend';

import { CODE_LENGTH, CODE_TTL_SECONDS } from './authRules';

// Тестова адреса Resend: доходить лише на пошту власника акаунта, поки немає свого домену
const DEFAULT_FROM = 'tic·tac·toe <onboarding@resend.dev>';

const cryptoRandom = (bytes: Uint32Array) => crypto.getRandomValues(bytes);

// Остача від 32-бітного числа на 10 дає практично рівномірну цифру
export const generateCode = (random = cryptoRandom): string => Array.from(
    random(new Uint32Array(CODE_LENGTH)),
    value => String(value % 10)
).join('');

type CodeEmail = {
    apiKey: string,
    from: string,
    to: string,
    subject: string,
    code: string
};

export const sendCodeEmail = async ({ apiKey, from, to, subject, code }: CodeEmail) => {
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${ apiKey }`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from,
            to: [ to ],
            subject,
            text: `Your tic·tac·toe code is ${ code }. It expires in ${ CODE_TTL_SECONDS / 60 } minutes.`
        })
    });

    if (!response.ok) {
        throw new Error(`Could not send the email (${ response.status })`);
    }
};

const codeProvider = (id: string, subject: string) => Resend({
    id,
    apiKey: process.env.AUTH_RESEND_KEY,
    maxAge: CODE_TTL_SECONDS,
    generateVerificationToken: async () => generateCode(),
    sendVerificationRequest: async ({ identifier, provider, token }) => {
        await sendCodeEmail({
            apiKey: provider.apiKey ?? '',
            from: process.env.AUTH_EMAIL_FROM ?? DEFAULT_FROM,
            to: identifier,
            subject,
            code: token
        });
    }
});

export const ResendOTP = codeProvider('resend-otp', 'Your tic·tac·toe verification code');

export const ResendOTPPasswordReset = codeProvider('resend-otp-password-reset', 'Reset your tic·tac·toe password');
```

Run: `npx vitest run convex/otp.test.ts`
Expected: PASS.

- [ ] **Step 6: Підключи провайдер у `convex/auth.ts`**

```ts
import Google from '@auth/core/providers/google';
import { Password } from '@convex-dev/auth/providers/Password';
import { convexAuth } from '@convex-dev/auth/server';

import { normalizeEmail, validatePassword } from './authRules';
import { ResendOTP, ResendOTPPasswordReset } from './otp';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [
        Google,
        Password({
            profile: params => {
                const name = typeof params.name === 'string' ? params.name.trim() : '';

                // Ім'я приходить лише при signUp; в інших сценаріях не перетираємо наявне
                return {
                    email: normalizeEmail(params.email),
                    ...(name ? { name } : {})
                };
            },
            validatePasswordRequirements: validatePassword,
            verify: ResendOTP,
            reset: ResendOTPPasswordReset
        })
    ]
});
```

- [ ] **Step 7: `users.me` повертає пошту (тест падає)**

У `convex/test.setup.ts` функція `asUser` вставляє ще `email: \`${ name.toLowerCase() }@example.com\``.

У `convex/users.test.ts` очікування другого тесту стає таким:

```ts
expect(await alice.client.query(api.users.me, {})).toEqual({
    name: 'Alice',
    email: 'alice@example.com',
    avatar: 'https://example.com/Alice.png'
});
```

Run: `npx vitest run convex/users.test.ts`
Expected: FAIL, бо у відповіді немає `email`.

- [ ] **Step 8: Додай `email` у `convex/users.ts`**

```ts
return {
    name: user.name ?? '',
    email: user.email ?? '',
    avatar: user.image ?? ''
};
```

Run: `npm run test:once`
Expected: PASS (усі тести, включно з `games.test.ts`).

- [ ] **Step 9: Розгорни функції в dev і перевір вручну**

У терміналі має працювати `npx convex dev`: він сам завантажить нові функції. Перевір у логах Convex, що немає помилок про `AUTH_RESEND_KEY`.

- [ ] **Step 10: Commit**

```bash
git add convex
git commit -m "feat(convex): email and password sign-in with 6-digit codes via Resend

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

- [ ] **Step 1: Згенеруй компоненти**

```bash
npx shadcn@latest add dropdown-menu sheet alert-dialog avatar -y
npm run lint:fix
```

Далі прожени сканери `tailwind-format` по нових файлах. Стилі під канвас:
- **dropdown-menu:** `DropdownMenuContent` — `rounded-xl border-border bg-popover p-1.5 shadow-2xl`; `DropdownMenuItem` — `min-h-11 rounded-lg px-2.5 text-sm focus:bg-accent`; варіант `destructive` — `text-danger focus:text-danger`.
- **alert-dialog:** контент — `rounded-2xl border-border bg-card`, оверлей — `bg-[#080916]/70`. Це єдиний hex у класах: прозорість саме цього відтінку токеном не задати. Або заведи `--overlay: rgb(8 9 22 / 0.72)` і клас `bg-(--overlay)`.
- **sheet:** контент справа — `w-82 border-l-border bg-card`.

- [ ] **Step 2: Хуки**

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

- [ ] **Step 3: Тест інвайта (падає)**

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

- [ ] **Step 4: Реалізуй `src/lib/invite.ts` і `src/lib/initials.ts`**

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

- [ ] **Step 5: Дрібні компоненти**

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

- [ ] **Step 6: `LeaveGameDialog`**

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

- [ ] **Step 7: `AccountMenu` (десктоп) і `MobileMenu` (телефон)**

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

- [ ] **Step 8: Тест шапки (падає)**

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

- [ ] **Step 9: `AppHeader` і `AppLayout`**

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

- [ ] **Step 10: Маршрути й `PublicRoute`**

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

- [ ] **Step 11: Тест `PublicRoute` (падає, потім проходить)**

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

- [ ] **Step 12: Ручна перевірка**

`npm run dev`, увійди через Google:
- Шапка: логотип і дропдаун з ім'ям.
- У грі в меню є ID, «Copy invite link», «Back to lobby», «Sign out», а логотип просить підтвердження.
- У DevTools на ширині 390px: бургер відкриває бокову панель.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: app header with account dropdown, phone menu and leave confirmation

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Вхід — сторінка Sign in, пам'ять незавершеного входу, тексти помилок

**Files:**
- Create:
  - `src/auth/pendingAuthContext.ts`, `src/auth/PendingAuthProvider.tsx`, `src/auth/usePendingAuth.ts`;
  - `src/lib/authError.ts`, `src/lib/authError.test.ts`;
  - `src/components/{AuthSplitLayout,HeroBoard,GoogleButton,PasswordInput,FieldError,OrDivider}/…`;
  - `src/pages/SignInPage/{SignInPage.tsx,index.ts,SignInPage.test.tsx}`.
- Modify: `src/main.tsx`, `src/App.tsx`, `src/routes/PrivateRoute/PrivateRoute.test.tsx`, `package.json`
- Delete: `src/pages/LoginPage`

**Interfaces:**
- Consumes: `useFrom()`, `Button`, `Input`, `Label`, `Logo`, Convex Auth `signIn(provider, params) → Promise<{ signingIn: boolean }>`.
- Produces:
  - `type Pending = { email: string, password?: string }`;
  - `<PendingAuthProvider initial?>`;
  - `usePendingAuth(): { pending: Pending | null, setPending: (value: Pending | null) => void }`;
  - `type AuthFlow = 'signIn' | 'signUp' | 'email-verification' | 'reset' | 'reset-verification'`;
  - `authError(error: unknown, flow: AuthFlow): string`;
  - `<AuthSplitLayout hero headline lead footnote>`, `<GoogleButton label />`, `<PasswordInput … />`, `<FieldError>`, `<OrDivider />`.

- [ ] **Step 1: Залежності форм**

```bash
npm i react-hook-form zod @hookform/resolvers
```

- [ ] **Step 2: Пам'ять незавершеного входу**

Пароль живе лише в пам'яті React: потрібен, щоб «Resend code» міг повторити вхід. Після перезавантаження його немає, і це очікувано (Review Focus 2).

`src/auth/pendingAuthContext.ts`:

```ts
import { createContext } from 'react';

export type Pending = { email: string, password?: string };

export type PendingAuth = {
    pending: Pending | null,
    setPending: (value: Pending | null) => void
};

export const PendingAuthContext = createContext<PendingAuth | null>(null);
```

`src/auth/PendingAuthProvider.tsx`:

```tsx
import { type FC, type ReactNode, useMemo, useState } from 'react';

import { type Pending, PendingAuthContext } from './pendingAuthContext';

type PendingAuthProviderProps = {
    children: ReactNode,
    initial?: Pending | null
};

const PendingAuthProvider: FC<PendingAuthProviderProps> = ({ children, initial = null }) => {
    const [ pending, setPending ] = useState<Pending | null>(initial);
    const value = useMemo(() => ({ pending, setPending }), [ pending ]);

    return <PendingAuthContext value={ value }>{ children }</PendingAuthContext>;
};

export default PendingAuthProvider;
```

`src/auth/usePendingAuth.ts`:

```ts
import { use } from 'react';

import { PendingAuthContext } from './pendingAuthContext';

const usePendingAuth = () => {
    const context = use(PendingAuthContext);

    if (!context) {
        throw new Error('usePendingAuth must be used inside PendingAuthProvider');
    }

    return context;
};

export default usePendingAuth;
```

У `main.tsx` загорни `<BrowserRouter>` у `<PendingAuthProvider>`.

- [ ] **Step 3: Тест текстів помилок (падає)**

Тексти серверних помилок взяті з `node_modules/@convex-dev/auth/dist`:
- `Invalid credentials` — `signIn` з неправильним паролем;
- `InvalidAccountId`, `InvalidSecret`, `TooManyFailedAttempts` — `retrieveAccount`;
- `Account … already exists` — `signUp`;
- `Could not verify code`, `Invalid code` — коди.

Перед реалізацією звір їх:

```bash
grep -rhn "throw new Error(" node_modules/@convex-dev/auth/dist/server/implementation node_modules/@convex-dev/auth/dist/providers/Password.js
```

`src/lib/authError.test.ts`:

```ts
import { expect, test } from 'vitest';

import authError from './authError';

test('a wrong password reads as wrong credentials', () => {
    expect(authError(new Error('InvalidSecret'), 'signIn')).toBe('Wrong email or password');
});

test('an existing account on sign-up points to sign in', () => {
    expect(authError(new Error('Account alice@example.com already exists'), 'signUp'))
        .toBe('An account with this email already exists. Sign in instead');
});

test('too many attempts asks to wait', () => {
    expect(authError(new Error('TooManyFailedAttempts'), 'signIn')).toBe('Too many attempts. Try again later');
});

// На prod Convex ховає текст звичайних Error, тож кожен сценарій має свій запасний текст
test('a redacted server error still gets a clear message', () => {
    expect(authError(new Error('[Request ID: 1] Server Error'), 'signUp'))
        .toBe('Could not create the account. If you already have one, sign in instead');
    expect(authError(new Error('[Request ID: 1] Server Error'), 'email-verification')).toBe('Wrong or expired code');
});
```

Run: `npx vitest run src/lib/authError.test.ts`
Expected: FAIL, бо модуля ще немає.

- [ ] **Step 4: Реалізуй `src/lib/authError.ts`**

```ts
export type AuthFlow = 'signIn' | 'signUp' | 'email-verification' | 'reset' | 'reset-verification';

const FALLBACK: Record<AuthFlow, string> = {
    'signIn': 'Wrong email or password',
    'signUp': 'Could not create the account. If you already have one, sign in instead',
    'email-verification': 'Wrong or expired code',
    'reset': 'Could not send the code. Check the email and try again',
    'reset-verification': 'Wrong or expired code'
};

// Серверні тексти бачимо лише в dev: на prod Convex їх ховає, тож завжди є запасний текст сценарію
const authError = (error: unknown, flow: AuthFlow): string => {
    const text = error instanceof Error ? error.message : '';

    if (text.includes('TooManyFailedAttempts')) {
        return 'Too many attempts. Try again later';
    }

    if (flow === 'signUp' && text.includes('already exists')) {
        return 'An account with this email already exists. Sign in instead';
    }

    if (text.includes('at least 8 characters')) {
        return 'Password must be at least 8 characters';
    }

    return FALLBACK[ flow ];
};

export default authError;
```

Run: `npx vitest run src/lib/authError.test.ts`
Expected: PASS.

- [ ] **Step 5: Спільні компоненти сторінок входу**

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

- [ ] **Step 6: Тест сторінки входу (падає)**

`src/pages/SignInPage/SignInPage.test.tsx`:

```tsx
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import PendingAuthProvider from '@/auth/PendingAuthProvider';
import usePendingAuth from '@/auth/usePendingAuth';
import useFrom from '@/hooks/useFrom';

import SignInPage from './SignInPage';

const signIn = vi.fn();

vi.mock('@convex-dev/auth/react', () => ({
    useAuthActions: () => ({ signIn })
}));

const VerifyProbe = () => {
    const { pending } = usePendingAuth();

    return <p>{ `verify ${ pending?.email } ${ useFrom() }` }</p>;
};

const renderSignIn = () => render(
    <PendingAuthProvider>
        <MemoryRouter initialEntries={ [ { pathname: '/login', state: { from: '/game/g1' } } ] }>
            <Routes>
                <Route
                    path="/login"
                    element={ <SignInPage /> }
                />
                <Route
                    path="/verify"
                    element={ <VerifyProbe /> }
                />
                <Route
                    path="/game/:gameId"
                    element={ <p>game page</p> }
                />
            </Routes>
        </MemoryRouter>
    </PendingAuthProvider>
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

// Review Focus 1: непідтверджена пошта — на екран коду, а не «неправильний пароль»
test('an unverified account goes to the code screen, keeping where to return', async () => {
    signIn.mockResolvedValue({ signingIn: false });

    renderSignIn();
    await fillAndSubmit('alice@example.com', 'secret123');

    expect(await screen.findByText('verify alice@example.com /game/g1')).toBeTruthy();
});

test('a wrong password shows an error and stays on the page', async () => {
    signIn.mockRejectedValue(new Error('InvalidSecret'));

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

- [ ] **Step 7: `SignInPage`** (артборди `Main`, `MobileSignIn`)

```tsx
import { useAuthActions } from '@convex-dev/auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { type FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { z } from 'zod';

import usePendingAuth from '@/auth/usePendingAuth';
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
    const { setPending } = usePendingAuth();
    const navigate = useNavigate();
    const from = useFrom();
    const [ formError, setFormError ] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

    const onSubmit = handleSubmit(async ({ email, password }) => {
        setFormError(null);

        try {
            const { signingIn } = await signIn('password', { email, password, flow: 'signIn' });

            if (signingIn) {
                navigate(from, { replace: true });

                return;
            }

            // Пошта ще не підтверджена: Convex Auth надіслав код і чекає flow email-verification
            setPending({ email, password });
            navigate('/verify', { state: { from } });
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
                    <div className="flex items-baseline justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link
                            to="/reset"
                            state={ { from } }
                            className="text-sm text-link hover:text-link-hover"
                        >
                            Forgot password?
                        </Link>
                    </div>
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

- [ ] **Step 8: Маршрут і старий тест `PrivateRoute`**

- В `App.tsx`: `/login` тепер рендерить `<SignInPage />`.
- Видали `src/pages/LoginPage`.
- У `PrivateRoute.test.tsx`:
  - імпорт `LoginPage` → `SignInPage`, загорнутий у `<PendingAuthProvider>`;
  - кнопка `'Login with google'` → `'Continue with Google'`;
  - мок `useAuthActions` лишається.

Run: `npm run test:once`
Expected: PASS.

- [ ] **Step 9: Ручна перевірка**

`npm run dev`, вийди з акаунта:
- `/login` має вигляд як `Main` (десктоп) і `MobileSignIn` (390px).
- Неправильний пароль — помилка під полем.
- Google працює, як і раніше.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: email and password sign-in page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Реєстрація і підтвердження пошти кодом

**Files:**
- Create:
  - `src/components/ui/input-otp.tsx`;
  - `src/lib/passwordStrength.ts`, `src/lib/passwordStrength.test.ts`;
  - `src/components/AuthCardLayout/…`, `src/components/CodeInput/…`;
  - `src/pages/SignUpPage/{SignUpPage.tsx,index.ts,SignUpPage.test.tsx}`;
  - `src/pages/VerifyEmailPage/{VerifyEmailPage.tsx,index.ts,VerifyEmailPage.test.tsx}`.
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes:
  - `usePendingAuth`, `useFrom`, `authError`;
  - `MIN_PASSWORD_LENGTH`, `CODE_LENGTH`, `RESEND_AFTER_SECONDS` з `@convex/authRules`;
  - `AuthSplitLayout`, `GoogleButton`, `PasswordInput`, `FieldError`, `OrDivider`.
- Produces:
  - `passwordStrength(password: string): 0 | 1 | 2 | 3`;
  - `<AuthCardLayout back={ { to, label } }>`;
  - `<CodeInput id value onChange onComplete? invalid? />` — 6 клітинок `input-otp`.

- [ ] **Step 1: Тест сили пароля (падає)**

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

- [ ] **Step 2: `src/lib/passwordStrength.ts`**

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

- [ ] **Step 3: `input-otp`, `CodeInput`, `AuthCardLayout`**

```bash
npx shadcn@latest add input-otp -y
npm run lint:fix
```

Слоти мають вигляд як на артборді `Components` → InputOTP:
- `h-14 flex-1 rounded-lg border border-border bg-field font-mono text-2xl`;
- активний слот — `border-2 border-ring`;
- між слотами `gap-2`, без сепаратора.

`CodeInput/CodeInput.tsx`:

```tsx
import type { FC } from 'react';

import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { CODE_LENGTH } from '@convex/authRules';

type CodeInputProps = {
    id: string,
    value: string,
    invalid?: boolean,
    onChange: (value: string) => void,
    onComplete?: (value: string) => void
};

const CodeInput: FC<CodeInputProps> = ({ id, value, invalid, onChange, onComplete }) => (
    <InputOTP
        id={ id }
        maxLength={ CODE_LENGTH }
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="^[0-9]+$"
        value={ value }
        aria-invalid={ invalid ? true : undefined }
        onChange={ onChange }
        onComplete={ onComplete }
    >
        <InputOTPGroup className="flex w-full gap-2">
            { Array.from({ length: CODE_LENGTH }, (_, index) => (
                <InputOTPSlot
                    key={ index }
                    index={ index }
                />
            )) }
        </InputOTPGroup>
    </InputOTP>
);

export default CodeInput;
```

`AuthCardLayout` (артборди `VerifyEmail`, `ResetPassword` і мобільні):
- зверху рядок: `Logo` (лінк на `/login`) і лінк «назад» з `ArrowLeft`;
- нижче по центру картка: `max-w-105 rounded-2xl border border-line bg-card px-9 py-10 flex flex-col gap-7`;
- на телефоні картка без рамки й фону: `max-md:border-0 max-md:bg-transparent max-md:p-0`, групою `max-md` у `cn([…])`.

- [ ] **Step 4: Тести реєстрації (падають)**

`src/pages/SignUpPage/SignUpPage.test.tsx`. Обгортка й `VerifyProbe` — як у `SignInPage.test.tsx`, стартовий маршрут `/signup` зі `state: { from: '/game/g1' }`.

```tsx
const fill = async (name: string, email: string, password: string) => {
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Name'), name);
    await user.type(screen.getByLabelText('Email'), email);
    await user.type(screen.getByLabelText('Password'), password);
    await user.click(screen.getByRole('button', { name: 'Create account' }));
};

test('a short password is rejected before calling the server', async () => {
    renderSignUp();
    await fill('Alice Smith', 'alice@example.com', 'short');

    expect(await screen.findByText('Password must be at least 8 characters')).toBeTruthy();
    expect(signIn).not.toHaveBeenCalled();
});

test('creates the account and asks for the emailed code', async () => {
    signIn.mockResolvedValue({ signingIn: false });

    renderSignUp();
    await fill('Alice Smith', 'alice@example.com', 'tictac2026');

    expect(signIn).toHaveBeenCalledWith('password', {
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'tictac2026',
        flow: 'signUp'
    });
    expect(await screen.findByText('verify alice@example.com /game/g1')).toBeTruthy();
});

test('an existing account points to sign in', async () => {
    signIn.mockRejectedValue(new Error('Account alice@example.com already exists'));

    renderSignUp();
    await fill('Alice Smith', 'alice@example.com', 'tictac2026');

    expect(await screen.findByText('An account with this email already exists. Sign in instead')).toBeTruthy();
});
```

Run: `npx vitest run src/pages/SignUpPage`
Expected: FAIL, бо `./SignUpPage` ще немає.

- [ ] **Step 5: `SignUpPage`** (артборди `SignUp`, `MobileSignUp`)

Будова та сама, що в `SignInPage`, з такими відмінностями:
- `hero="column"`, `headline` — «Your name on<br />every scoreboard.», `lead` — «One account for every device. Sign in with Google or with your email.», `footnote` — «We only email you codes for sign-in and password reset.»;
- заголовок «Create an account», підзаголовок «It takes less than a minute.»;
- `GoogleButton label="Sign up with Google"`;
- поля: `Name` (`autoComplete="nickname"`, placeholder «Shown to your opponent»), `Email`, `Password` (`PasswordInput`, `autoComplete="new-password"`);
- під паролем індикатор: `grid grid-cols-3 gap-1.5`, три смужки `h-1 rounded-full`. Смужка `i` має `bg-circle`, якщо `i < passwordStrength(password)`, інакше `bg-border`. Пароль бери з `watch('password')`;
- підказка під паролем — «At least 8 characters; a mix of letters and digits is stronger.» (`text-sm text-muted-foreground`), а при помилці валідації — `FieldError`;
- кнопка «Create account», футер «Already have an account? Sign in» → `/login` зі `state={ { from } }`.

Схема:

```ts
const schema = z.object({
    name: z.string().trim().min(1, { error: 'Enter your name' }).max(40, { error: 'Keep it under 40 characters' }),
    email: z.string().trim().toLowerCase().pipe(z.email({ error: 'Enter a valid email' })),
    password: z.string().min(MIN_PASSWORD_LENGTH, { error: `Password must be at least ${ MIN_PASSWORD_LENGTH } characters` })
});
```

Відправка:

```ts
const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setFormError(null);

    try {
        const { signingIn } = await signIn('password', { name, email, password, flow: 'signUp' });

        if (signingIn) {
            navigate(from, { replace: true });

            return;
        }

        setPending({ email, password });
        navigate('/verify', { state: { from } });
    } catch (error) {
        setFormError(authError(error, 'signUp'));
    }
});
```

`formError` показуй через `FieldError` над кнопкою.

Run: `npx vitest run src/pages/SignUpPage`
Expected: PASS.

- [ ] **Step 6: Тести підтвердження (падають)**

`src/pages/VerifyEmailPage/VerifyEmailPage.test.tsx`:

```tsx
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import PendingAuthProvider from '@/auth/PendingAuthProvider';
import type { Pending } from '@/auth/pendingAuthContext';

import VerifyEmailPage from './VerifyEmailPage';

const signIn = vi.fn();

vi.mock('@convex-dev/auth/react', () => ({
    useAuthActions: () => ({ signIn })
}));

const PENDING: Pending = { email: 'alice@example.com', password: 'secret123' };

const renderVerify = (pending: Pending | null) => render(
    <PendingAuthProvider initial={ pending }>
        <MemoryRouter initialEntries={ [ { pathname: '/verify', state: { from: '/game/g1' } } ] }>
            <Routes>
                <Route
                    path="/verify"
                    element={ <VerifyEmailPage /> }
                />
                <Route
                    path="/game/:gameId"
                    element={ <p>game page</p> }
                />
                <Route
                    path="/login"
                    element={ <p>login page</p> }
                />
            </Routes>
        </MemoryRouter>
    </PendingAuthProvider>
);

afterEach(() => {
    cleanup();
    signIn.mockReset();
    vi.useRealTimers();
});

// Review Focus 3: після коду людина повертається в гру, з якої прийшла
test('a complete code signs in and returns to the original page', async () => {
    signIn.mockResolvedValue({ signingIn: true });

    renderVerify(PENDING);
    await userEvent.setup().type(screen.getByLabelText('Verification code'), '123456');

    expect(signIn).toHaveBeenCalledWith('password', { email: 'alice@example.com', code: '123456', flow: 'email-verification' });
    expect(await screen.findByText('game page')).toBeTruthy();
});

test('a wrong code shows an error', async () => {
    signIn.mockRejectedValue(new Error('Could not verify code'));

    renderVerify(PENDING);
    await userEvent.setup().type(screen.getByLabelText('Verification code'), '000000');

    expect(await screen.findByText('Wrong or expired code')).toBeTruthy();
});

// Review Focus 2: після перезавантаження пам'ять порожня — пояснюємо, а не шлемо порожній запит
test('explains that the session expired when nothing is pending', () => {
    renderVerify(null);

    expect(screen.getByText('Your sign-in session expired')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to sign in' })).toBeTruthy();
    expect(signIn).not.toHaveBeenCalled();
});

test('the code can be sent again after a minute', () => {
    vi.useFakeTimers();
    signIn.mockResolvedValue({ signingIn: false });

    renderVerify(PENDING);

    expect(screen.getByRole('button', { name: /Resend in/ })).toHaveProperty('disabled', true);

    act(() => {
        vi.advanceTimersByTime(60_000);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Resend code' }));

    expect(signIn).toHaveBeenCalledWith('password', { email: 'alice@example.com', password: 'secret123', flow: 'signIn' });
});
```

Run: `npx vitest run src/pages/VerifyEmailPage`
Expected: FAIL, бо `./VerifyEmailPage` ще немає.

- [ ] **Step 7: `VerifyEmailPage`** (артборди `VerifyEmail`, `MobileVerifyEmail`)

```tsx
import { useAuthActions } from '@convex-dev/auth/react';
import { Mail } from 'lucide-react';
import { type FC, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';

import usePendingAuth from '@/auth/usePendingAuth';
import AuthCardLayout from '@/components/AuthCardLayout';
import CodeInput from '@/components/CodeInput';
import FieldError from '@/components/FieldError';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import useFrom from '@/hooks/useFrom';
import authError from '@/lib/authError';
import { RESEND_AFTER_SECONDS } from '@convex/authRules';

const clock = (seconds: number) => `${ Math.floor(seconds / 60) }:${ String(seconds % 60).padStart(2, '0') }`;

const VerifyEmailPage: FC = () => {
    const { signIn } = useAuthActions();
    const { pending, setPending } = usePendingAuth();
    const navigate = useNavigate();
    const from = useFrom();
    const [ code, setCode ] = useState('');
    const [ error, setError ] = useState<string | null>(null);
    const [ isChecking, setIsChecking ] = useState(false);
    const [ resendAt, setResendAt ] = useState(() => Date.now() + RESEND_AFTER_SECONDS * 1000);
    const [ now, setNow ] = useState(() => Date.now());

    // Відлік від дедлайну, а не ланцюжок setTimeout: інакше фейкові таймери в тесті зсувають лише одну секунду
    useEffect(
        () => {
            const timer = setInterval(() => {
                setNow(Date.now());
            }, 1000);

            return () => {
                clearInterval(timer);
            };
        },
        []
    );

    const secondsLeft = Math.max(0, Math.ceil((resendAt - now) / 1000));

    if (!pending) {
        return (
            <AuthCardLayout back={ { to: '/login', label: 'Back' } }>
                <h1 className="font-display text-3xl font-bold tracking-tight">Your sign-in session expired</h1>
                <p className="text-muted-foreground">Sign in again and we&apos;ll send you a new code.</p>
                <Button
                    asChild
                    size="lg"
                >
                    <Link
                        to="/login"
                        state={ { from } }
                    >
                        Back to sign in
                    </Link>
                </Button>
            </AuthCardLayout>
        );
    }

    const verify = async (value: string) => {
        setError(null);
        setIsChecking(true);

        try {
            await signIn('password', { email: pending.email, code: value, flow: 'email-verification' });
            setPending(null);
            navigate(from, { replace: true });
        } catch (verifyError) {
            setError(authError(verifyError, 'email-verification'));
            setCode('');
        } finally {
            setIsChecking(false);
        }
    };

    const resend = async () => {
        setResendAt(Date.now() + RESEND_AFTER_SECONDS * 1000);
        setNow(Date.now());

        try {
            await signIn('password', { email: pending.email, password: pending.password, flow: 'signIn' });
            toast.success('New code sent');
        } catch (resendError) {
            toast.error(authError(resendError, 'signIn'));
        }
    };

    return (
        <AuthCardLayout back={ { to: '/signup', label: 'Back' } }>
            <span className="flex size-13 items-center justify-center rounded-xl bg-secondary text-circle">
                <Mail className="size-6" />
            </span>
            <div className="flex flex-col gap-2.5">
                <h1 className="font-display text-3xl font-bold tracking-tight">Check your email</h1>
                <p className="leading-relaxed text-muted-foreground">
                    We sent a 6-digit code to
                    { ' ' }
                    <span className="font-medium text-foreground">{ pending.email }</span>
                    . Enter it to finish creating your account.
                </p>
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="code">Verification code</Label>
                <CodeInput
                    id="code"
                    value={ code }
                    invalid={ error !== null }
                    onChange={ setCode }
                    onComplete={
                        value => {
                            void verify(value);
                        }
                    }
                />
                <FieldError>{ error }</FieldError>
            </div>
            <Button
                size="lg"
                disabled={ code.length < 6 || isChecking }
                onClick={
                    () => {
                        void verify(code);
                    }
                }
            >
                Verify and continue
            </Button>
            <Button
                variant="link"
                disabled={ secondsLeft > 0 }
                className="self-center"
                onClick={
                    () => {
                        void resend();
                    }
                }
            >
                { secondsLeft > 0 ? `Resend in ${ clock(secondsLeft) }` : 'Resend code' }
            </Button>
        </AuthCardLayout>
    );
};

export default VerifyEmailPage;
```

Хуки викликаються до раннього `return`: правило `react-hooks/rules-of-hooks` має мовчати. Якщо правило `react-hooks/purity` скаржиться на `Date.now()` в ініціалізаторах `useState`, додай поруч коментар `// eslint-disable-next-line react-hooks/purity` з поясненням: ініціалізатор виконується один раз.

Run: `npx vitest run src/pages/VerifyEmailPage`
Expected: PASS.

- [ ] **Step 8: Маршрути**

В `App.tsx` поруч із `/login` додай:

```tsx
<Route
    path="/signup"
    element={ <PublicRoute restricted><SignUpPage /></PublicRoute> }
/>
<Route
    path="/verify"
    element={ <PublicRoute restricted><VerifyEmailPage /></PublicRoute> }
/>
```

Run: `npm run lint:fix && npm run typecheck && npm run test:once`
Expected: PASS.

- [ ] **Step 9: Ручна перевірка з реальною поштою**

Перевір повний ланцюжок на пошті власника акаунта Resend: на інші адреси тестовий відправник листів не доставляє.
1. Вийди з акаунта й відкрий `/game/test-1?mark=circle`, тебе перекине на `/login`.
2. «Create an account» → ім'я, пошта, пароль → екран коду.
3. Лист приходить з кодом із 6 цифр, введи його.
4. Ти в грі `test-1`.

Повтори з паролем, але без введення коду: вийди й увійди знову — має знову бути екран коду і новий лист.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: sign-up with emailed 6-digit verification code

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Скидання пароля

**Files:**
- Create: `src/pages/ResetPasswordPage/{ResetPasswordPage.tsx,index.ts,ResetPasswordPage.test.tsx}`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `AuthCardLayout`, `CodeInput`, `PasswordInput`, `FieldError`, `authError`, `useFrom`, `MIN_PASSWORD_LENGTH`, `CODE_LENGTH`.

- [ ] **Step 1: Тести (падають)**

Обгортка — як у `VerifyEmailPage.test.tsx`, маршрут `/reset` без `state`, плюс маршрут `/` з `<p>lobby page</p>`.

```tsx
const requestCode = async (email: string) => {
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Email'), email);
    await user.click(screen.getByRole('button', { name: 'Send reset code' }));

    return user;
};

test('asks for the code after sending it to the email', async () => {
    signIn.mockResolvedValue({ signingIn: false });

    renderReset();
    await requestCode('alice@example.com');

    expect(signIn).toHaveBeenCalledWith('password', { email: 'alice@example.com', flow: 'reset' });
    expect(await screen.findByText('Set a new password')).toBeTruthy();
    expect(screen.getByText('alice@example.com')).toBeTruthy();
});

test('sets the new password with the code and signs in', async () => {
    signIn.mockResolvedValue({ signingIn: true });

    renderReset();

    const user = await requestCode('alice@example.com');

    await user.type(await screen.findByLabelText('Reset code'), '123456');
    await user.type(screen.getByLabelText('New password'), 'newsecret1');
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    expect(signIn).toHaveBeenLastCalledWith('password', {
        email: 'alice@example.com',
        code: '123456',
        newPassword: 'newsecret1',
        flow: 'reset-verification'
    });
    expect(await screen.findByText('lobby page')).toBeTruthy();
});

test('a short new password is rejected before calling the server', async () => {
    signIn.mockResolvedValue({ signingIn: false });

    renderReset();

    const user = await requestCode('alice@example.com');

    await user.type(await screen.findByLabelText('Reset code'), '123456');
    await user.type(screen.getByLabelText('New password'), 'short');
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    expect(await screen.findByText('Password must be at least 8 characters')).toBeTruthy();
    expect(signIn).toHaveBeenCalledTimes(1);
});
```

Run: `npx vitest run src/pages/ResetPasswordPage`
Expected: FAIL, бо сторінки ще немає.

- [ ] **Step 2: `ResetPasswordPage`** (артборди `ResetPassword`, `MobileResetPassword`)

Стан: `step: 'email' | 'code'`, `email`. Зверху індикатор кроків:
- `ol` з двома `li` («Email», «New password»), між ними лінія `h-px flex-1 bg-border`;
- поточний крок — кружечок `bg-circle text-primary-foreground` і `aria-current="step"`;
- пройдений — `bg-border` з іконкою `Check`.

**Крок `email`:**
- заголовок «Forgot your password?», текст «Enter the email you signed up with and we'll send you a reset code.»;
- поле `Email`, кнопка «Send reset code»;
- відправка — `signIn('password', { email, flow: 'reset' })`, далі `setStep('code')`; помилка — `authError(error, 'reset')`.

**Крок `code`:**
- заголовок «Set a new password»;
- текст «Code sent to {email}.», де пошта в окремому `<span className="font-medium text-foreground">` (тест шукає її як окремий текст), і кнопка-лінк «Change» (`variant="link"`, повертає `step` на `email`);
- поля `Reset code` (`CodeInput id="reset-code"`, без автовідправки) і `New password` (`PasswordInput`, `autoComplete="new-password"`);
- кнопка «Update password»;
- перевірка перед запитом:
  - якщо `code.length < CODE_LENGTH` → «Enter the 6-digit code»;
  - якщо пароль коротший за `MIN_PASSWORD_LENGTH` → «Password must be at least 8 characters»;
- відправка — `signIn('password', { email, code, newPassword, flow: 'reset-verification' })`, далі `navigate(from, { replace: true })`; помилка — `authError(error, 'reset-verification')`.

Лінк «назад» у `AuthCardLayout` — `{ to: '/login', label: 'Back to sign in' }` зі збереженням `from`.

Run: `npx vitest run src/pages/ResetPasswordPage`
Expected: PASS.

- [ ] **Step 3: Маршрут і ручна перевірка**

В `App.tsx`:

```tsx
<Route
    path="/reset"
    element={ <PublicRoute restricted><ResetPasswordPage /></PublicRoute> }
/>
```

`npm run dev`:
1. «Forgot password?» → пошта → лист з кодом.
2. Код і новий пароль → ти в лобі.
3. Вийди й увійди з новим паролем — працює.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: password reset with emailed code

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

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

- [ ] **Step 1: Тести лобі (падають)**

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

- [ ] **Step 2: Компоненти**

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

- [ ] **Step 3: `HomePage`** (артборди `Lobby`, `LobbyJoin`, `MobileLobby`, `MobileLobbyJoin`)

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

- [ ] **Step 4: Ручна перевірка**

`npm run dev`:
- Лобі збігається з `Lobby` / `LobbyJoin` на десктопі й `MobileLobby` / `MobileLobbyJoin` на 390px.
- Перемикання вкладок не губить вибір позначки.
- Копіювання ID показує toast.

- [ ] **Step 5: Commit**

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

- [ ] **Step 1: Тест статусу (падає)**

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

- [ ] **Step 2: `src/lib/gameStatus.ts`**

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

- [ ] **Step 3: Тести сторінки гри (падають)**

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

- [ ] **Step 4: Згенеруй `dialog` і `drawer`**

```bash
npx shadcn@latest add dialog drawer -y
npm run lint:fix
```

- У `dialog.tsx` має бути проп `showCloseButton`. Якщо його немає, додай його: `showCloseButton = true`, а кнопку закриття рендер лише при `true`.
- Стилі контенту: `rounded-[22px] border-border bg-card p-8 sm:max-w-110`.
- Оверлей обох компонентів — той самий, що в alert-dialog (задача 3).
- `DrawerContent` — `rounded-t-3xl border-t border-border bg-card`; ручка зверху `h-1 w-10 bg-border`.

- [ ] **Step 5: `BoardCell` і `Board`**

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

- [ ] **Step 6: `TurnStatus` і `PlayerCard`**

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

- [ ] **Step 7: `WaitingForOpponent`** (артборди `Waiting`, `MobileWaiting`)

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

- [ ] **Step 8: `GamePage`** (артборди `Game`, `GameOpponent`, `MobilePlay`, `MobileOpponent`, `MobileGame`)

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

- [ ] **Step 9: Ручна перевірка у двох вікнах**

`npm run dev`, звичайне вікно й інкогніто, два різні акаунти:
1. Перший створює гру — бачить «Waiting for an opponent». На 390px це нижня панель зі «Share invite link».
2. Другий вставляє ID у Join — обидва бачать гру. У того, хто чекає, «Alex's turn» з анімованими крапками й темнішими порожніми клітинками.
3. Виграш — три клітинки підсвічуються кольором переможця, плашка «You take the round», через ~1.5 с поле очищається.
4. Нічия — «Draw. Nobody takes this one».
5. «Back to lobby» в одного — у другого знову «Waiting for an opponent».

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: redesigned game screen with turn status and waiting sheet

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Прибирання, документація, prod

**Files:**
- Modify: `src/index.css`, `README.md`, `CLAUDE.md`, `package.json`, `docs/superpowers/plans/2026-10-15-redesign-email-auth.md`
- Delete: `src/assets/not-avatar.jpg` і все, що лишилось невикористаним

- [ ] **Step 1: Прибери legacy**

- З `src/index.css` видали блок `/* Legacy … */`.
- Перевір, що нічого не посилається на старі класи, файли й пакети:

```bash
grep -rnE "blue-dark|bg-red|border-green|text-green|bg-blue-50|stone-300|not-avatar|react-hot-toast|react-loader-spinner|root-modal" src index.html vitest.config.ts
```

  Expected: порожньо.
- Видали `src/assets/not-avatar.jpg` і теку `src/assets`, якщо вона спорожніла.

- [ ] **Step 2: Ревізія формату**

Прожени сканери зі скіла `.claude/skills/tailwind-format/` по всьому `src` і виправ знахідки.

Run: `npm run lint:fix && npm run typecheck && npm run test:once && npm run build`
Expected: усе зелене.

- [ ] **Step 3: Документація**

- **`README.md`:** вхід — Google або пошта з паролем. Для локальної розробки потрібен `AUTH_RESEND_KEY` у Convex dev; без власного домену коди приходять лише на пошту власника Resend.
- **`CLAUDE.md`:**
  - **Стек:** додай shadcn/ui (`src/components/ui`, правляться як свій код і за тими самими правилами форматування), `lucide-react`, `sonner`, `react-hook-form` + `zod`.
  - **Розділ «Деплой і секрети»:** `AUTH_RESEND_KEY` (dev і prod), необов'язковий `AUTH_EMAIL_FROM` — адреса відправника після підтвердження домену в Resend.
  - **Конвенції:** дизайн — канвас https://claude.ai/artifact/PDTUiw8QMxFx1aLJRnp4US; кольори лише через токени в `src/index.css`.
  - **Історія:** «Редизайн і вхід поштою — жовтень 2026, план `docs/superpowers/plans/2026-10-15-redesign-email-auth.md`».

- [ ] **Step 4: 👤 Prod**

Власник:

```bash
npx convex env set AUTH_RESEND_KEY <ключ> --prod
```

Коли в Resend підтверджено домен (DNS-записи SPF/DKIM у реєстратора), ще одна змінна:

```bash
npx convex env set AUTH_EMAIL_FROM "tic·tac·toe <noreply@твій-домен>" --prod
```

Без домену реєстрація поштою на prod працюватиме лише для пошти власника Resend. Вхід через Google — для всіх.

- [ ] **Step 5: Повна ручна перевірка (QA)**

На `npm run dev` і на 390px, позначай у плані:
1. **Google-вхід з прямого посилання** `/game/:id` → назад у гру.
2. **Реєстрація поштою з прямого посилання** → код → назад у гру (Review Focus 3).
3. **Вхід у непідтверджений акаунт** → новий код (Review Focus 1).
4. **Перезавантаження на `/verify`** → «Your sign-in session expired» (Review Focus 2).
5. **Скидання пароля** → вхід з новим паролем.
6. **Google + пошта з тією самою адресою:** спершу Google, потім реєстрація поштою на ту саму адресу з підтвердженням коду → це той самий користувач (те саме ім'я в меню, та сама гра відкривається з обох входів).
7. **Лобі:** копіювання ID, вставка з буфера, «Enter the game ID» на порожньому полі.
8. **Гра у двох вікнах:** хід, виграш, нічия, Clear, New session, подвійний клік по клітинці — один хід.
9. **Меню десктоп і телефон:** копіювання ID, інвайт (копія на десктопі, меню «Поділитися» на телефоні, скасування без помилки — Review Focus 4), «Back to lobby» і «Sign out» з підтвердженням, логотип у грі з підтвердженням (Review Focus 5).
10. **Клавіатура:** Tab проходить усі кнопки й поля, Esc закриває меню й діалог виходу, але не діалог очікування.

- [ ] **Step 6: Commit і передача власнику**

```bash
git add -A
git commit -m "chore: drop legacy styles, document email sign-in and the redesign

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Відміть усі кроки плану як виконані й скажи власнику, що гілку можна пушити: Netlify після мерджу в `main` сам розгорне Convex prod і фронт.
