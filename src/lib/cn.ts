import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Іменований експорт потрібен файлам shadcn/ui: вони імпортують `{ cn }` з аліасу utils
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export default cn;
