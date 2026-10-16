import type { FC } from 'react';

import FadeSwitch from '@/components/FadeSwitch';
import cn from '@/lib/cn';
import type { GameStatus } from '@/lib/gameStatus';

const DOT = 'size-1.5 animate-wait-dot rounded-full motion-reduce:animate-none';

const TurnStatus: FC<{ status: GameStatus }> = ({ status }) => {
    const color = {
        'bg-circle': status.tone === 'circle',
        'bg-cross': status.tone === 'cross',
        'bg-muted-foreground': status.tone === 'muted'
    };

    return (
        <FadeSwitch switchKey={ status.text }>
            <div className="flex min-h-16 flex-col items-center gap-2">
                <p
                    role="status"
                    className="flex h-10 items-center gap-2.5 rounded-full border border-line bg-card px-4.5 font-medium"
                >
                    { status.waiting
                        ? (
                            <span
                                aria-hidden="true"
                                className="flex gap-1"
                            >
                                <span className={ cn(DOT, color) } />
                                <span className={ cn(DOT, color, '[animation-delay:200ms]') } />
                                <span className={ cn(DOT, color, '[animation-delay:400ms]') } />
                            </span>
                        )
                        : (
                            <span
                                aria-hidden="true"
                                className={ cn('size-2.5 rounded-full', color) }
                            />
                        ) }
                    { status.text }
                </p>
                { status.hint && <p className="text-center text-sm text-muted-foreground">{ status.hint }</p> }
            </div>
        </FadeSwitch>
    );
};

export default TurnStatus;
