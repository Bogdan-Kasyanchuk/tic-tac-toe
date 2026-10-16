import { Label as LabelPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

const Label = ({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) => (
    <LabelPrimitive.Root
        data-slot="label"
        className={ cn('text-sm font-medium text-label select-none', className) }
        { ...props }
    />
);

export { Label };
