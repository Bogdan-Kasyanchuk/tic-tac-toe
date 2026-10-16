import type { FC, ReactNode } from 'react';

import HeroBoard from '@/components/HeroBoard';
import Logo from '@/components/Logo';
import cn from '@/lib/cn';

type AuthSplitLayoutProps = {
    hero: 'diagonal' | 'column',
    headline: ReactNode,
    lead: string,
    footnote: string,
    children: ReactNode
};

// Десктоп: ліва панель з полем і заголовком, форма праворуч. Телефон: лише логотип і форма
const AuthSplitLayout: FC<AuthSplitLayoutProps> = ({ hero, headline, lead, footnote, children }) => (
    <div className="flex min-h-dvh">
        <section
            className={
                cn([
                    'hidden',
                    'md:flex md:flex-1 md:flex-col md:justify-between md:gap-12 md:border-r md:border-line md:bg-muted md:px-14 md:py-12'
                ])
            }
        >
            <Logo />
            <div className="flex flex-col gap-8">
                <HeroBoard variant={ hero } />
                <div className="flex max-w-115 flex-col gap-4">
                    <h1 className="font-display text-5xl leading-none font-extrabold tracking-tight">{ headline }</h1>
                    <p className="text-lg leading-relaxed text-muted-foreground">{ lead }</p>
                </div>
            </div>
            <p className="text-sm text-subtle">{ footnote }</p>
        </section>
        <section
            className={
                cn([
                    'flex flex-1 flex-col px-6 pt-14 pb-8',
                    'md:items-center md:justify-center md:py-12'
                ])
            }
        >
            <div
                className={
                    cn([
                        'flex w-full max-w-95 grow flex-col gap-6',
                        'md:grow-0'
                    ])
                }
            >
                <Logo className="md:hidden" />
                { children }
            </div>
        </section>
    </div>
);

export default AuthSplitLayout;
