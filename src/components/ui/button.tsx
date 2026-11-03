import { type VariantProps, cva } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

// Розміри й стани — аркуш Components канвасу: кнопка 50 з текстом 18, натиснута стискається до 98 %, іконка — до 96 %
const buttonVariants = cva(
    [
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-lg font-medium whitespace-nowrap transition outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4.5'
    ],
    {
        variants: {
            variant: {
                default: 'bg-primary font-semibold text-primary-foreground hover:bg-white active:bg-label active:scale-98 disabled:bg-border disabled:text-subtle',
                secondary: 'border border-border bg-secondary text-secondary-foreground hover:border-border-hover hover:bg-accent active:border-border-hover active:bg-border active:scale-98 disabled:border-line disabled:bg-card disabled:text-placeholder',
                ghost: 'text-muted-foreground hover:bg-secondary hover:text-foreground active:bg-accent active:scale-98 disabled:bg-transparent disabled:text-placeholder',
                destructive: 'border border-danger-border bg-danger-bg font-semibold text-danger hover:bg-danger-hover active:bg-danger-pressed active:scale-98 disabled:opacity-50',
                link: 'h-auto p-0 text-link underline-offset-4 hover:text-link-hover hover:underline active:text-foreground'
            },
            size: {
                'default': 'h-12.5 px-3',
                'icon': 'size-12.5',
                // Бургер і закриття меню на телефоні: кругла 44
                'icon-round': 'size-11 rounded-full'
            }
        },
        compoundVariants: [
            {
                // Кнопка-іконка: сірий гліф, під курсором світлішає, рамка не змінюється
                variant: 'secondary',
                size: [ 'icon', 'icon-round' ],
                className: 'text-muted-foreground hover:border-border hover:text-foreground active:border-border active:scale-96'
            }
        ],
        defaultVariants: {
            variant: 'default',
            size: 'default'
        }
    }
);

const Button = ({
    className,
    variant = 'default',
    size = 'default',
    asChild = false,
    ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) => {
    const Comp = asChild ? Slot.Root : 'button';

    return (
        <Comp
            data-slot="button"
            data-variant={ variant }
            data-size={ size }
            className={ cn(buttonVariants({ variant, size, className })) }
            { ...props }
        />
    );
};

export { Button, buttonVariants };
