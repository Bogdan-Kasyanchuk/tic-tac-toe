import type { FC } from 'react';

import Fade from '@/components/Fade';
import MarkIcon from '@/components/MarkIcon';
import cn from '@/lib/cn';
import type { Cell, Mark } from '@convex/rules';

type BoardCellProps = {
    index: number,
    value: Cell,
    win: Mark | null,
    locked: boolean,
    dim: boolean,
    onSelect: (index: number) => void
};

const label = (index: number, value: Cell) => `Row ${ Math.floor(index / 3) + 1 }, column ${ (index % 3) + 1 }: ${ value || 'empty' }`;

const BoardCell: FC<BoardCellProps> = ({ index, value, win, locked, dim, onSelect }) => (
    <button
        type="button"
        aria-label={ label(index, value) }
        data-win={ win ?? undefined }
        disabled={ locked || value !== '' }
        className={
            cn([
                'relative flex items-center justify-center rounded-2xl border-2 border-line bg-card transition-colors enabled:hover:border-border enabled:hover:bg-secondary disabled:cursor-default',
                'max-md:rounded-xl'
            ], {
                'bg-muted': dim && value === '',
                'border-circle bg-circle/16': win === 'circle',
                'border-cross bg-cross/16': win === 'cross'
            })
        }
        onClick={
            () => {
                onSelect(index);
            }
        }
    >
        <Fade
            show={ value !== '' }
            className="flex size-[58%] items-center justify-center"
        >
            { value && (
                <MarkIcon
                    mark={ value }
                    className="size-full"
                />
            ) }
        </Fade>
    </button>
);

export default BoardCell;
