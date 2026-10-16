import type { FC } from 'react';

import MarkIcon from '@/components/MarkIcon';
import UserAvatar from '@/components/UserAvatar';
import cn from '@/lib/cn';
import { firstName } from '@/lib/initials';
import type { PlayerView } from '@/types/game';
import type { Mark } from '@convex/rules';

type PlayerCardProps = {
    mark: Mark,
    player: PlayerView | null,
    isMe: boolean,
    active: boolean,
    activity: string | null
};

const PlayerCard: FC<PlayerCardProps> = ({ mark, player, isMe, active, activity }) => {
    if (!player) {
        return (
            <div
                className={
                    cn([
                        'flex min-w-0 items-center gap-2.5 rounded-2xl border-2 border-dashed border-border p-3 text-muted-foreground',
                        'md:gap-3.5 md:p-4'
                    ])
                }
            >
                <span
                    className={
                        cn([
                            'size-8 shrink-0 rounded-full border-2 border-dashed border-border',
                            'md:size-11'
                        ])
                    }
                />
                <span className="font-medium">Open seat</span>
            </div>
        );
    }

    return (
        <div
            className={
                cn([
                    'flex min-w-0 items-center gap-2.5 rounded-2xl border-2 bg-card p-3',
                    'md:gap-3.5 md:p-4'
                ], {
                    'border-circle': active && mark === 'circle',
                    'border-cross': active && mark === 'cross',
                    'border-line': !active
                })
            }
        >
            <span className="md:hidden">
                <UserAvatar
                    name={ player.name }
                    avatar={ player.avatar }
                    tone={ mark }
                    size="sm"
                />
            </span>
            <span className="max-md:hidden">
                <UserAvatar
                    name={ player.name }
                    avatar={ player.avatar }
                    tone={ mark }
                    size="md"
                />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span
                    className={
                        cn([
                            'truncate text-sm font-semibold',
                            'md:hidden'
                        ])
                    }
                >
                    { isMe ? 'You' : firstName(player.name) }
                </span>
                <span
                    className={
                        cn([
                            'flex min-w-0 items-center gap-2 font-semibold',
                            'max-md:hidden'
                        ])
                    }
                >
                    <span className="truncate">{ player.name }</span>
                    { isMe && <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">YOU</span> }
                </span>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MarkIcon
                        mark={ mark }
                        className="size-3.5"
                    />
                    <span className="max-md:hidden">{ mark === 'circle' ? 'Circle' : 'Cross' }</span>
                    { activity && (
                        <span
                            className={
                                cn('max-md:hidden', {
                                    'text-link': mark === 'circle',
                                    'text-cross-light': mark === 'cross'
                                })
                            }
                        >
                            { activity }
                        </span>
                    ) }
                </span>
            </span>
            <span
                aria-label="Score"
                className={
                    cn([
                        'font-display text-3xl font-bold',
                        'md:text-4xl'
                    ])
                }
            >
                { player.score }
            </span>
        </div>
    );
};

export default PlayerCard;
