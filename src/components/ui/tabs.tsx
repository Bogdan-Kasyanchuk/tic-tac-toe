import { Tabs as TabsPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/cn';

// Спрощено під канвас: лише горизонтальні вкладки-«пігулки», без варіанта line і dark:-класів (тема одна, темна)
function Tabs({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
    return (
        <TabsPrimitive.Root
            data-slot="tabs"
            className={
                cn(
                    'flex flex-col gap-6',
                    className
                )
            }
            { ...props }
        />
    );
}

function TabsList({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
    return (
        <TabsPrimitive.List
            data-slot="tabs-list"
            className={
                cn(
                    'grid h-auto w-full grid-cols-2 gap-1 rounded-xl border border-line bg-field p-1',
                    className
                )
            }
            { ...props }
        />
    );
}

function TabsTrigger({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
    return (
        <TabsPrimitive.Trigger
            data-slot="tabs-trigger"
            className={
                cn(
                    'inline-flex h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold whitespace-nowrap text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-border data-[state=active]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
                    className
                )
            }
            { ...props }
        />
    );
}

function TabsContent({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
    return (
        <TabsPrimitive.Content
            data-slot="tabs-content"
            className={
                cn(
                    'flex flex-col gap-6 outline-none',
                    className
                )
            }
            { ...props }
        />
    );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
