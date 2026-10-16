import { useQuery } from 'convex/react';
import { type FC, useState } from 'react';
import { Link, useMatch } from 'react-router';

import AccountMenu from '@/components/AccountMenu';
import LeaveGameDialog from '@/components/LeaveGameDialog';
import Logo from '@/components/Logo';
import MobileMenu from '@/components/MobileMenu';
import useLeaveGame, { type LeaveIntent } from '@/hooks/useLeaveGame';
import useMediaQuery, { DESKTOP } from '@/hooks/useMediaQuery';
import cn from '@/lib/cn';
import { api } from '@convex/_generated/api';

const AppHeader: FC = () => {
    const gameCode = useMatch('/game/:gameId')?.params.gameId ?? null;
    const isDesktop = useMediaQuery(DESKTOP);
    // Та сама підписка, що й на сторінці гри, тож Convex не робить другого запиту
    const tone = useQuery(api.games.get, gameCode ? { code: gameCode } : 'skip')?.me ?? 'circle';
    const leaveGame = useLeaveGame(gameCode);
    const [ confirm, setConfirm ] = useState<LeaveIntent | null>(null);

    // У грі будь-який вихід питає підтвердження; у лобі гри немає, тож Sign out одразу
    const onRequest = (intent: LeaveIntent) => {
        if (gameCode) {
            setConfirm(intent);

            return;
        }

        void leaveGame(intent);
    };

    return (
        <header className="border-b border-secondary">
            <div
                className={
                    cn([
                        'flex h-18 items-center justify-between gap-4 px-5',
                        'md:px-8'
                    ])
                }
            >
                <Link
                    to="/"
                    aria-label="tic·tac·toe home"
                    onClick={
                        event => {
                            if (gameCode) {
                                event.preventDefault();
                                setConfirm('lobby');
                            }
                        }
                    }
                >
                    <Logo />
                </Link>
                { isDesktop
                    ? (
                        <AccountMenu
                            gameCode={ gameCode }
                            tone={ tone }
                            onRequest={ onRequest }
                        />
                    )
                    : (
                        <MobileMenu
                            gameCode={ gameCode }
                            tone={ tone }
                            onRequest={ onRequest }
                        />
                    ) }
            </div>
            <LeaveGameDialog
                intent={ confirm }
                onCancel={
                    () => {
                        setConfirm(null);
                    }
                }
                onConfirm={
                    () => {
                        const intent = confirm;

                        setConfirm(null);

                        if (intent) {
                            void leaveGame(intent);
                        }
                    }
                }
            />
        </header>
    );
};

export default AppHeader;
