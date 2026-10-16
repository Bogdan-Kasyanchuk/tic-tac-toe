import { type VariantProps, cva } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

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
