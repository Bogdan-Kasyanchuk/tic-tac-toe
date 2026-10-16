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

const ITEM = 'h-13 w-full justify-start gap-3.5 rounded-xl px-3 text-base text-foreground [&_svg:not([class*=size-])]:size-5';

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
                    size="icon"
                    aria-label="Open menu"
                    className="rounded-full bg-card"
                >
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent
                showCloseButton={ false }
                className="gap-5 px-4 pt-12 pb-8 shadow-[-16px_0_48px_rgba(0,0,0,0.45)]"
            >
                <div className="flex items-center justify-between pl-2">
                    <SheetTitle className="font-display text-xl font-bold">Menu</SheetTitle>
                    <SheetClose asChild>
                        <Button
                            variant="secondary"
                            size="icon"
                            aria-label="Close menu"
                            className="rounded-full"
                        >
                            <X />
                        </Button>
                    </SheetClose>
                </div>
                <SheetDescription className="sr-only">Account and game</SheetDescription>
                <div className="flex items-center gap-3.5 px-2 py-1">
                    <UserAvatar
                        name={ name }
                        avatar={ me?.avatar ?? '' }
                        tone={ tone }
                        size="lg"
                    />
                    <span className="flex min-w-0 flex-col gap-1">
                        <span className="text-lg font-semibold">{ name }</span>
                        <span className="truncate text-sm text-muted-foreground">{ me?.email }</span>
                    </span>
                </div>
                <hr className="mx-3 border-border" />
                { gameCode && (
                    <div className="flex flex-col gap-2 px-2">
                        <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Game ID</span>
                        <div className="flex h-12 items-center gap-1.5 rounded-xl border border-border bg-field pr-0.5 pl-3">
                            <span className="min-w-0 flex-1 truncate font-mono text-sm font-medium">{ gameCode }</span>
                            <CopyButton
                                text={ gameCode }
                                label="Copy game ID"
                                success="Game ID copied"
                            />
                        </div>
                    </div>
                ) }
                <nav className="flex flex-col gap-1">
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
                            <hr className="mx-3 my-1.5 border-border" />
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
                    <p className="mx-2 mt-auto text-sm/normal text-muted-foreground">
                        Back to lobby and Sign out end the current game for both players. You confirm first.
                    </p>
                ) }
            </SheetContent>
        </Sheet>
    );
};

export default MobileMenu;
