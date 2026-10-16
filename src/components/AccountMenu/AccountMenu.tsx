import { useQuery } from 'convex/react';
import { ArrowLeft, ChevronDown, Copy, Link2, LogOut } from 'lucide-react';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import UserAvatar from '@/components/UserAvatar';
import type { LeaveIntent } from '@/hooks/useLeaveGame';
import { copyText, inviteLink } from '@/lib/invite';
import { api } from '@convex/_generated/api';

type AccountMenuProps = {
    gameCode: string | null,
    onRequest: (intent: LeaveIntent) => void
};

const AccountMenu: FC<AccountMenuProps> = ({ gameCode, onRequest }) => {
    const me = useQuery(api.users.me);
    const name = me?.name ?? '';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="secondary"
                    className="group rounded-full bg-card pr-3 pl-1.5 text-sm"
                >
                    <UserAvatar
                        name={ name }
                        avatar={ me?.avatar ?? '' }
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
                <DropdownMenuLabel className="flex items-center gap-3 p-2.5 font-normal">
                    <UserAvatar
                        name={ name }
                        avatar={ me?.avatar ?? '' }
                        size="md"
                    />
                    <span className="flex min-w-0 flex-col gap-1">
                        <span className="truncate text-sm font-semibold">{ name }</span>
                        <span className="truncate text-sm text-muted-foreground">{ me?.email }</span>
                    </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                { gameCode && (
                    <>
                        <DropdownMenuLabel className="px-2.5 pt-2 pb-0 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                            Game ID
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                            className="mx-1 mt-2 mb-1 h-11 min-h-0 rounded-lg border border-border bg-field pr-0.5 pl-3 focus:border-ring focus:bg-field"
                            onSelect={
                                () => {
                                    void copyText(gameCode, 'Game ID copied');
                                }
                            }
                        >
                            <span className="min-w-0 flex-1 truncate font-mono text-sm font-medium">{ gameCode }</span>
                            <span className="sr-only">Copy game ID</span>
                            <span className="flex size-10 items-center justify-center rounded-md bg-secondary">
                                <Copy />
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onSelect={
                                () => {
                                    void copyText(inviteLink(gameCode), 'Invite link copied');
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
