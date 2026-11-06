import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Власні кеглі, інтервали, трекінг і тіні з @theme у src/index.css. Без цього tailwind-merge приймає `text-score` за колір:
// лишає поруч `text-lg` і викидає `text-foreground`. Новий --text-*, --leading-*, --tracking-* чи --shadow-* у темі — додати сюди
const twMerge = extendTailwindMerge({
    extend: {
        theme: {
            text: [ 'page-title', 'score', 'score-sm', 'dialog-title', 'logo', 'hero' ],
            leading: [ 'body', 'heading' ],
            tracking: [ 'title', 'heading', 'label' ],
            shadow: [ 'menu', 'dialog', 'drawer' ]
        }
    }
});

// Іменований експорт потрібен файлам shadcn/ui: вони імпортують `{ cn }` з аліасу utils
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export default cn;
