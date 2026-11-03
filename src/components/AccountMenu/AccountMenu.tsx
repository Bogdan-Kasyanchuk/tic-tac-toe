import { useQuery } from 'convex/react';
import { ArrowLeft, Check, ChevronDown, Copy, Link2, LogOut } from 'lucide-react';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import UserAvatar from '@/components/UserAvatar';
import useCopy from '@/hooks/useCopy';
import type { LeaveIntent } from '@/hooks/useLeaveGame';
import { copyInvite } from '@/lib/invite';
import { api } from '@convex/_generated/api';
import type { Mark } from '@convex/rules';

type AccountMenuProps = {
    gameCode: string | null,
    // Колір аватара: у грі — позначка гравця, у лобі — нейтральний
    tone: Mark,
    onRequest: (intent: LeaveIntent) => void
};

const AccountMenu: FC<AccountMenuProps> = ({ gameCode, tone, onRequest }) => {
    const me = useQuery(api.users.me);
    const name = me?.name ?? '';
    const { copied, copy: copyGameId } = useCopy(gameCode ?? '', 'Game ID copied');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                { /* Кнопка росте разом з іменем і не обрізає його: так на аркуші Long names */ }
                <Button
                    variant="secondary"
                    className="group h-11 gap-3 rounded-full bg-card pr-3 pl-2 text-sm hover:border-border hover:bg-secondary active:border-border active:bg-accent active:scale-100"
                >
                    <UserAvatar
                        name={ name }
                        avatar={ me?.avatar ?? '' }
                        tone={ tone }
                        size="sm"
                    />
                    { name }
                    <ChevronDown className="text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-75"
            >
                { /* Ім'я й аватар уже на кнопці, тож угорі меню лише пошта */ }
                <DropdownMenuLabel
                    title={ me?.email }
                    className="truncate p-3 text-sm font-normal text-muted-foreground"
                >
                    { me?.email }
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                { gameCode && (
                    <>
                        <div className="flex flex-col gap-2 px-3 pt-2 pb-3">
                            <DropdownMenuLabel className="p-0 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                                Game ID
                            </DropdownMenuLabel>
                            { /* Як на мобільному: поле — лише текст, копіює кнопка; меню після копіювання лишається відкритим */ }
                            <div className="flex gap-2">
                                <span
                                    title={ gameCode }
                                    className="h-12.5 min-w-0 flex-1 truncate rounded-lg border border-border bg-field px-4 font-mono text-lg leading-12 font-medium"
                                >
                                    { gameCode }
                                </span>
                                <DropdownMenuItem
                                    aria-label="Copy game ID"
                                    className="size-12.5 min-h-0 shrink-0 justify-center rounded-lg border border-border bg-card p-0 text-muted-foreground transition focus:bg-accent focus:text-foreground active:scale-96 active:bg-border"
                                    onSelect={
                                        event => {
                                            event.preventDefault();
                                            void copyGameId();
                                        }
                                    }
                                >
                                    { copied ? <Check className="text-current" /> : <Copy className="text-current" /> }
                                </DropdownMenuItem>
                            </div>
                        </div>
                        <DropdownMenuItem
                            onSelect={
                                () => {
                                    void copyInvite(gameCode);
                                }
                            }
                        >
                            <Link2 />
                            Copy invite link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={
                                () => {
                                    onRequest('lobby');
                                }
                            }
                        >
                            <ArrowLeft />
                            Back to lobby
                        </DropdownMenuItem>
                    </>
                ) }
                <DropdownMenuItem
                    variant="destructive"
                    onSelect={
                        () => {
                            onRequest('signOut');
                        }
                    }
                >
                    <LogOut />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default AccountMenu;
