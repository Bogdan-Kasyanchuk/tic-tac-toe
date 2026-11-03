import { Link2, Share2 } from 'lucide-react';
import type { FC, ReactNode } from 'react';

import CopyButton from '@/components/CopyButton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import useLeaveGame from '@/hooks/useLeaveGame';
import useMediaQuery, { DESKTOP } from '@/hooks/useMediaQuery';
import cn from '@/lib/cn';
import { copyInvite, shareInvite } from '@/lib/invite';

const WaitDots: FC = () => (
    <span
        aria-hidden="true"
        className="flex justify-center gap-2"
    >
        <span className="size-3 animate-wait-dot rounded-full bg-circle motion-reduce:animate-none" />
        <span className="size-3 animate-wait-dot rounded-full bg-circle [animation-delay:200ms] motion-reduce:animate-none" />
        <span className="size-3 animate-wait-dot rounded-full bg-circle [animation-delay:400ms] motion-reduce:animate-none" />
    </span>
);

// Закрити можна лише через «Cancel and leave»: без суперника гра не почнеться
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
            <Dialog open>
                <DialogContent
                    showCloseButton={ false }
                    className="flex flex-col gap-6"
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
                        <DialogTitle className="font-display text-dialog-title font-bold tracking-tight">Waiting for an opponent</DialogTitle>
                        <DialogDescription>Send this game ID to a friend. The game starts as soon as they join.</DialogDescription>
                    </div>
                    { body }
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer
            dismissible={ false }
            open
        >
            <DrawerContent className="flex flex-col gap-5 px-5 pb-9">
                <WaitDots />
                <div className="flex flex-col gap-2">
                    <DrawerTitle className="font-display text-dialog-title font-extrabold tracking-tight">Waiting for an opponent</DrawerTitle>
                    <DrawerDescription>Share the invite link. The game starts as soon as your friend joins.</DrawerDescription>
                </div>
                { body }
            </DrawerContent>
        </Drawer>
    );
};

export default WaitingForOpponent;
