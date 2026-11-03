import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

const Input = ({ className, type, ...props }: ComponentProps<'input'>) => (
    <input
        type={ type }
        data-slot="input"
        className={
            cn(
                'h-12.5 w-full min-w-0 rounded-lg border border-input bg-field px-4 text-lg text-foreground transition outline-none placeholder:text-placeholder hover:not-focus:border-border-hover focus:border-ring focus:ring-3 focus:ring-ring/25 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:border-line disabled:bg-card disabled:text-placeholder',
                className
            )
        }
        { ...props }
    />
);

export { Input };
