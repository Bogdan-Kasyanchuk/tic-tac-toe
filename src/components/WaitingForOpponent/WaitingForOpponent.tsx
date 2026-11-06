import { Link2, Share2 } from 'lucide-react';
import type { FC, ReactNode } from 'react';

import CopyButton from '@/components/CopyButton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import useLeaveGame from '@/hooks/useLeaveGame';
import useMediaQuery, { DESKTOP } from '@/hooks/useMediaQuery';
import cn from '@/lib/cn';
import { copyInvite, shareInvite } from '@/lib/invite';

const DOT = cn([
    'size-2.5 animate-wait-pulse rounded-full bg-circle motion-reduce:animate-none motion-reduce:opacity-70',
    'md:size-3'
]);

const WaitDots: FC = () => (
    <span
        aria-hidden="true"
        className="flex justify-center gap-2"
    >
        <span className={ DOT } />
        <span className={ cn(DOT, '[animation-delay:200ms]') } />
        <span className={ cn(DOT, '[animation-delay:400ms]') } />
    </span>
);

// Шапка лишається незатемненою й робочою, як на артбордах Waiting: затемнення починається під нею, діалог стоїть по центру решти екрана.
// Немодальні діалог і шторка свого затемнення не малюють, тому воно тут. Шторка — Sheet, а не vaul: vaul не передає modal у Radix
const Backdrop: FC = () => (
    <div
        aria-hidden="true"
        className={
            cn([
                'fixed inset-x-0 top-18 bottom-0 z-50 bg-overlay-drawer animate-in fade-in-0',
                'md:bg-overlay'
            ])
        }
    />
);

// Самі діалог і шторка не закриваються: без суперника гра не почнеться, вийти можна кнопкою «Cancel and leave» або через шапку
const WaitingForOpponent: FC<{ code: string }> = ({ code }) => {
    const isDesktop = useMediaQuery(DESKTOP);
    const leaveGame = useLeaveGame(code);

    const body: ReactNode = (
        <>
            <div className="flex gap-2">
                <p
                    title={ code }
                    className="h-12.5 min-w-0 flex-1 truncate rounded-lg border border-border bg-field px-4 font-mono text-lg leading-12 font-medium"
                >
                    { code }
                </p>
                <CopyButton
                    text={ code }
                    label="Copy game ID"
                    success="Game ID copied"
                />
            </div>
            <div
                className={
                    cn([
                        'flex flex-col gap-2',
                        'md:gap-3'
                    ])
                }
            >
                { isDesktop
                    ? (
                        <Button
                            variant="secondary"
                            onClick={
                                () => {
                                    void copyInvite(code);
                                }
                            }
                        >
                            <Link2 />
                            Copy invite link
                        </Button>
                    )
                    : (
                        <Button
                            onClick={
                                () => {
                                    void shareInvite(code);
                                }
                            }
                        >
                            <Share2 />
                            Share invite link
                        </Button>
                    ) }
                <Button
                    variant="ghost"
                    onClick={
                        () => {
                            void leaveGame('lobby');
                        }
                    }
                >
                    Cancel and leave
                </Button>
            </div>
        </>
    );

    if (isDesktop) {
        return (
            <Dialog
                modal={ false }
                open
            >
                <DialogContent
                    showCloseButton={ false }
                    className="top-[calc(50%+2.25rem)] flex flex-col gap-6"
                    onEscapeKeyDown={
                        event => {
                            event.preventDefault();
                        }
                    }
                    onInteractOutside={
                        event => {
                            event.preventDefault();
                        }
                    }
                >
                    <WaitDots />
                    <div className="flex flex-col gap-3">
                        <DialogTitle className="font-display text-dialog-title font-bold tracking-heading">Waiting for an opponent</DialogTitle>
                        <DialogDescription>Send this game ID to a friend. The game starts as soon as they join.</DialogDescription>
                    </div>
                    { body }
                </DialogContent>
                <Backdrop />
            </Dialog>
        );
    }

    return (
        <Sheet
            modal={ false }
            open
        >
            <SheetContent
                side="bottom"
                showCloseButton={ false }
                className="max-h-[80vh] gap-5 rounded-t-3xl px-5 pb-5 shadow-drawer"
                onOpenAutoFocus={
                    event => {
                        event.preventDefault();
                    }
                }
                onEscapeKeyDown={
                    event => {
                        event.preventDefault();
                    }
                }
                onInteractOutside={
                    event => {
                        event.preventDefault();
                    }
                }
            >
                <span
                    aria-hidden="true"
                    className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-border"
                />
                <WaitDots />
                <div className="flex flex-col gap-2">
                    <SheetTitle className="font-display text-logo font-extrabold tracking-heading">Waiting for an opponent</SheetTitle>
                    <SheetDescription className="text-base">Share the invite link. The game starts as soon as your friend joins.</SheetDescription>
                </div>
                { body }
            </SheetContent>
            <Backdrop />
        </Sheet>
    );
};

export default WaitingForOpponent;
