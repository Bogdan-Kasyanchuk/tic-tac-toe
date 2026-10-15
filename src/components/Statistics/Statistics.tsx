import type { FC } from 'react';

import FadeSwitch from '@/components/FadeSwitch';
import MarkIcon from '@/components/MarkIcon';
import cn from '@/lib/cn';
import type { GameView } from '@/types/game';
import type { Mark } from '@convex/rules';

type StatisticsProps = {
    turn: Mark,
    result: GameView[ 'result' ]
};

const LABEL = { win: 'Winner', draw: 'Draw' } as const;

const shownMark = (turn: Mark, result: GameView[ 'result' ]): Mark | null => {
    if (!result) {
        return turn;
    }

    return result.kind === 'win' ? result.mark : null;
};

const Statistics: FC<StatisticsProps> = ({ turn, result }) => {
    const label = result ? LABEL[ result.kind ] : 'Turn';
    const mark = shownMark(turn, result);

    return (
        <div className="flex items-center justify-end gap-x-5">
            <FadeSwitch switchKey={ label }>
                <p
                    className={
                        cn([
                            'flex items-center gap-x-5 text-2xl font-semibold',
                            'md:text-4xl'
                        ])
                    }
                >
                    { label }
                    { mark && <span>&#10142;</span> }
                </p>
            </FadeSwitch>
            <FadeSwitch switchKey={ mark ?? 'none' }>
                { mark && <MarkIcon mark={ mark } /> }
            </FadeSwitch>
        </div>
    );
};

export default Statistics;
