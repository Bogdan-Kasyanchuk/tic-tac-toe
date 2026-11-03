import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Власні кеглі й інтервали з @theme у src/index.css. Без цього tailwind-merge приймає `text-score` за колір:
// лишає поруч `text-lg` і викидає `text-foreground`. Новий --text-* чи --leading-* у темі — додати сюди
const twMerge = extendTailwindMerge({
    extend: {
        theme: {
            text: [ 'page-title', 'score', 'score-sm', 'dialog-title', 'logo', 'hero', 'hero-sm', 'form-title' ],
            leading: [ 'body', 'heading' ]
        }
    }
});

// Іменований експорт потрібен файлам shadcn/ui: вони імпортують `{ cn }` з аліасу utils
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export default cn;
