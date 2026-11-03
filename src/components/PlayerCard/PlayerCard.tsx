import type { FC } from 'react';

import MarkIcon from '@/components/MarkIcon';
import UserAvatar from '@/components/UserAvatar';
import cn from '@/lib/cn';
import type { PlayerView } from '@/types/game';
import type { Mark } from '@convex/rules';

type PlayerCardProps = {
    mark: Mark,
    player: PlayerView | null,
    isMe: boolean,
    active: boolean
};

// Висота картки фіксована (60 на телефоні, 80 на десктопі): довге ім'я обрізається трьома крапками, YOU і рахунок не стискаються
const CARD = 'flex h-15 min-w-0 items-center gap-3 rounded-2xl border-2 px-3';
const CARD_MD = 'md:h-20 md:gap-4 md:px-4';

const PlayerCard: FC<PlayerCardProps> = ({ mark, player, isMe, active }) => {
    if (!player) {
        return (
            <div
                className={
                    cn([
                        `${ CARD } border-dashed border-border text-muted-foreground`,
                        CARD_MD
                    ])
                }
            >
                <span
                    className={
                        cn([
                            'size-9 shrink-0 rounded-full border-2 border-dashed border-border',
                            'md:size-11'
                        ])
                    }
                />
                <span className="truncate">Open seat</span>
            </div>
        );
    }

    return (
        <div
            className={
                cn([
                    `${ CARD } bg-card`,
                    CARD_MD
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
                    size="card"
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
            <span
                className={
                    cn([
                        'flex min-w-0 flex-1 flex-col gap-1',
                        'md:gap-2'
                    ])
                }
            >
                { /* title — повне ім'я в підказці при наведенні, коли воно обрізане трьома крапками */ }
                <span
                    title={ isMe ? undefined : player.name }
                    className={
                        cn([
                            'truncate text-sm font-semibold',
                            'md:hidden'
                        ])
                    }
                >
                    { isMe ? 'You' : player.name }
                </span>
                <span
                    className={
                        cn([
                            'flex min-w-0 items-center gap-2 font-semibold',
                            'max-md:hidden'
                        ])
                    }
                >
                    <span
                        title={ player.name }
                        className="truncate"
                    >
                        { player.name }
                    </span>
                    { isMe && <span className="shrink-0 rounded-sm bg-secondary px-2 py-1 text-xs font-semibold text-muted-foreground">YOU</span> }
                </span>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MarkIcon
                        mark={ mark }
                        className="size-3.5"
                    />
                    { /* На телефоні лишається лише значок, назву позначки читає скрінрідер */ }
                    <span className="max-md:sr-only">{ mark === 'circle' ? 'Circle' : 'Cross' }</span>
                </span>
            </span>
            <span
                aria-label="Score"
                className={
                    cn([
                        'shrink-0 font-display text-score-sm font-bold',
                        'md:text-score'
                    ])
                }
            >
                { player.score }
            </span>
        </div>
    );
};

export default PlayerCard;
