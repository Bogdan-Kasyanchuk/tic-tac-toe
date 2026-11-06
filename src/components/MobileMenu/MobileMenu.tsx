import { useQuery } from 'convex/react';
import { ArrowLeft, LogOut, Menu, Share2, X } from 'lucide-react';
import { type FC, useState } from 'react';

import CopyButton from '@/components/CopyButton';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import UserAvatar from '@/components/UserAvatar';
import type { LeaveIntent } from '@/hooks/useLeaveGame';
import { shareInvite } from '@/lib/invite';
import { api } from '@convex/_generated/api';
import type { Mark } from '@convex/rules';

type MobileMenuProps = {
    gameCode: string | null,
    // Колір аватара: у грі — позначка гравця, у лобі — нейтральний
    tone: Mark,
    onRequest: (intent: LeaveIntent) => void
};

const ITEM = 'h-12.5 w-full justify-start gap-3 rounded-md px-3 font-normal text-foreground hover:bg-accent active:bg-border active:scale-100';

const MobileMenu: FC<MobileMenuProps> = ({ gameCode, tone, onRequest }) => {
    const me = useQuery(api.users.me);
    const [ open, setOpen ] = useState(false);
    const name = me?.name ?? '';

    // Спершу закриваємо меню, щоб діалог підтвердження не опинився під ним
    const request = (intent: LeaveIntent) => {
        setOpen(false);
        onRequest(intent);
    };

    return (
        <Sheet
            open={ open }
            onOpenChange={ setOpen }
        >
            <SheetTrigger asChild>
                <Button
                    variant="secondary"
                    size="icon-round"
                    aria-label="Open menu"
                    className="bg-card text-foreground"
                >
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent
                showCloseButton={ false }
                className="gap-5 px-5 pt-3.5 pb-5 shadow-[-16px_0_48px_rgba(0,0,0,0.45)]"
            >
                <div className="flex items-center justify-between pl-2">
                    <SheetTitle className="font-display text-xl leading-none font-bold">Menu</SheetTitle>
                    <SheetClose asChild>
                        <Button
                            variant="secondary"
                            size="icon-round"
                            aria-label="Close menu"
                            className="text-foreground"
                        >
                            <X />
                        </Button>
                    </SheetClose>
                </div>
                <SheetDescription className="sr-only">Account and game</SheetDescription>
                <div className="flex items-center gap-3">
                    <UserAvatar
                        name={ name }
                        avatar={ me?.avatar ?? '' }
                        tone={ tone }
                        size="lg"
                    />
                    <span className="flex min-w-0 flex-col">
                        { /* Довге ім'я й пошта переносяться, а не обрізаються; аватар лишається по центру */ }
                        <span className="text-lg font-semibold wrap-anywhere">{ name }</span>
                        <span className="text-sm wrap-anywhere text-muted-foreground">{ me?.email }</span>
                    </span>
                </div>
                <hr className="border-border" />
                { gameCode && (
                    <div className="flex flex-col gap-2 px-2">
                        <span className="text-sm leading-none font-medium tracking-label text-muted-foreground uppercase">Game ID</span>
                        <div className="flex gap-2">
                            <span
                                title={ gameCode }
                                className="h-12.5 min-w-0 flex-1 truncate rounded-lg border border-border bg-field px-4 font-mono text-lg leading-12 font-medium"
                            >{ gameCode }</span>
                            <CopyButton
                                text={ gameCode }
                                label="Copy game ID"
                                success="Game ID copied"
                            />
                        </div>
                    </div>
                ) }
                <nav className="flex flex-col">
                    { gameCode && (
                        <>
                            <Button
                                variant="ghost"
                                className={ ITEM }
                                onClick={
                                    () => {
                                        void shareInvite(gameCode);
                                    }
                                }
                            >
                                <Share2 />
                                Share invite link
                            </Button>
                            <hr className="my-1 border-border" />
                            <Button
                                variant="ghost"
                                className={ ITEM }
                                onClick={
                                    () => {
                                        request('lobby');
                                    }
                                }
                            >
                                <ArrowLeft />
                                Back to lobby
                            </Button>
                        </>
                    ) }
                    <Button
                        variant="ghost"
                        className={ `${ ITEM } text-danger hover:text-danger` }
                        onClick={
                            () => {
                                request('signOut');
                            }
                        }
                    >
                        <LogOut />
                        Sign out
                    </Button>
                </nav>
                { gameCode && (
                    <p className="mt-auto text-sm text-muted-foreground">
                        Back to lobby and Sign out end the current game for both players. You confirm first.
                    </p>
                ) }
            </SheetContent>
        </Sheet>
    );
};

export default MobileMenu;
