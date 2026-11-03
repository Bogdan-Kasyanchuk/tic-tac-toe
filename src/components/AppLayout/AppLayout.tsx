import type { FC } from 'react';
import { Outlet } from 'react-router';

import AppHeader from '@/components/AppHeader';
import cn from '@/lib/cn';

const AppLayout: FC = () => (
    <div className="flex min-h-dvh flex-col">
        <AppHeader />
        <main
            className={
                cn([
                    'mx-auto flex w-full max-w-280 grow flex-col px-5 py-6',
                    'md:px-8 md:py-10'
                ])
            }
        >
            <Outlet />
        </main>
    </div>
);

export default AppLayout;
