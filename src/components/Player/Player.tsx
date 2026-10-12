import type { FC } from 'react';

import notAvatar from '@/assets/not-avatar.jpg';
import MarkIcon from '@/components/MarkIcon';
import cn from '@/lib/cn';
import type { PlayerView } from '@/types/game';
import type { Mark } from '@convex/rules';

type PlayerProps = {
    mark: Mark,
    player: PlayerView | null
};

// referrerPolicy потрібен аватаркам з googleusercontent.com: без нього вони іноді віддають 403
const Player: FC<PlayerProps> = ({ mark, player }) => (
    <div
        className={
            cn([
                'flex items-center gap-x-5',
                'md:gap-x-8'
            ])
        }
    >
        <MarkIcon mark={ mark } />
        <div
            className={
                cn([
                    'ml-2.5 h-7 w-7 overflow-hidden rounded-full border border-white',
                    'md:ml-5 md:h-10 md:w-10'
                ])
            }
        >
            <img
                src={ player?.avatar || notAvatar }
                alt="Player"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
            />
        </div>
        <p
            className={
                cn([
                    'mr-auto max-w-37.5 truncate text-2xl font-semibold',
                    'md:max-w-105 md:text-4xl md:leading-tight'
                ])
            }
        >
            { player?.name || 'Player' }
        </p>
        <p
            className={
                cn([
                    'w-9 text-right text-3xl leading-none font-semibold',
                    'md:w-14 md:text-5xl'
                ])
            }
        >
            { player?.score ?? 0 }
        </p>
    </div>
);

export default Player;
