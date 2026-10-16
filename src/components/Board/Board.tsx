import type { FC } from 'react';

import BoardCell from '@/components/BoardCell';
import cn from '@/lib/cn';
import { canMove } from '@/lib/gameStatus';
import type { GameView } from '@/types/game';

type BoardProps = {
    game: GameView,
    onSelect: (index: number) => void
};

const Board: FC<BoardProps> = ({ game, onSelect }) => {
    const winner = game.result?.kind === 'win' ? game.result : null;
    const locked = !canMove(game);
    // Порожні клітинки темніші лише поки ходить суперник; після раунду поле має звичайний вигляд
    const dim = !game.result && game.turn !== game.me;

    return (
        <div
            className={
                cn([
                    'mx-auto grid aspect-square w-full max-w-120 grid-cols-3 grid-rows-3 gap-2',
                    'md:gap-2.5'
                ])
            }
        >
            { game.board.map((value, index) => (
                <BoardCell
                    key={ index }
                    index={ index }
                    value={ value }
                    win={ winner?.cells.includes(index) ? winner.mark : null }
                    locked={ locked }
                    dim={ dim }
                    onSelect={ onSelect }
                />
            )) }
        </div>
    );
};

export default Board;
