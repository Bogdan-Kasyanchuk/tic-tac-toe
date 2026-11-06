import { Check, CircleAlert } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

// Тема тільки темна, тож next-themes не потрібен. Вигляд — аркуш Components канвасу, секція Sonner:
// заголовок і підказка по 14 з інтервалом тексту 1.35, іконка в тонованому колі 28. Власні стилі sonner мають вищу специфічність, звідси `!`
const Toaster = (props: ToasterProps) => (
    <Sonner
        theme="dark"
        position="top-center"
        icons={
            {
                success: <Check strokeWidth={ 2.25 } />,
                error: <CircleAlert strokeWidth={ 2.25 } />
            }
        }
        toastOptions={
            {
                classNames: {
                    toast: 'gap-3! p-3! font-sans! text-sm! shadow-[0_12px_32px_rgba(0,0,0,0.35)]!',
                    content: 'gap-1!',
                    title: 'leading-body! font-semibold!',
                    description: 'leading-body! text-muted-foreground!',
                    icon: 'm-0! size-7! justify-center! rounded-full [&_svg]:size-4',
                    success: '[&_[data-icon]]:bg-circle/18 [&_[data-icon]]:text-link',
                    error: 'border-danger-border! [&_[data-icon]]:bg-destructive/16 [&_[data-icon]]:text-danger'
                }
            }
        }
        style={
            {
                '--normal-bg': 'var(--popover)',
                '--normal-text': 'var(--popover-foreground)',
                '--normal-border': 'var(--border)',
                '--border-radius': 'calc(var(--radius) + 4px)'
            } as CSSProperties
        }
        { ...props }
    />
);

export { Toaster };
