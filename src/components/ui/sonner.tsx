import type { CSSProperties } from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

// Тема тільки темна, тож next-themes не потрібен
const Toaster = (props: ToasterProps) => (
    <Sonner
        theme="dark"
        position="top-center"
        style={
            {
                '--normal-bg': 'var(--popover)',
                '--normal-text': 'var(--popover-foreground)',
                '--normal-border': 'var(--border)'
            } as CSSProperties
        }
        { ...props }
    />
);

export { Toaster };
