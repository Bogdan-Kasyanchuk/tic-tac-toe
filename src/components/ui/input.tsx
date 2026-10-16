import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

const Input = ({ className, type, ...props }: ComponentProps<'input'>) => (
    <input
        type={ type }
        data-slot="input"
        className={
            cn(
                'h-11 w-full min-w-0 rounded-lg border border-input bg-field px-3.5 text-base text-foreground transition-colors outline-none placeholder:text-placeholder focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50',
                className
            )
        }
        { ...props }
    />
);

export { Input };
