// Крива `transition` із Tailwind — та сама, що в старих CSS-переходах
export const TAILWIND_EASE = [ 0.4, 0, 0.2, 1 ] as const;

export const FADE = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
};
