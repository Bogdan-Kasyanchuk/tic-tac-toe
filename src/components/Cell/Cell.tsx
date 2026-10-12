import type { FC } from 'react';

import Fade from '@/components/Fade';
import cn from '@/lib/cn';
import type { Cell as CellValue, WinLine } from '@convex/rules';

import { winLineClassName } from './winLine';

type CellProps = {
    index: number,
    value: CellValue,
    winLine: WinLine | null,
    onSelect: (index: number) => void
};

const Cell: FC<CellProps> = ({ index, value, winLine, onSelect }) => {
    const line = value && winLine?.cells.includes(index) ? winLine.line : null;

    // Поки лінія згасає, AnimatePresence тримає останній елемент зі старим className, тож лінія не стрибає
    return (
        <div
            className={
                cn('relative flex cursor-pointer items-center justify-center bg-blue-50 transition hover:bg-blue-200', {
                    'pointer-events-none': value !== ''
                })
            }
            onClick={
                () => {
                    onSelect(index);
                }
            }
        >
            <Fade
                show={ value === 'circle' }
                className="h-3/4 w-3/4 rounded-full border-4 border-green"
            />
            <Fade
                show={ value === 'cross' }
                className="relative -top-0.5 w-full"
            >
                <div className="absolute h-1 w-full rotate-45 bg-red" />
                <div className="absolute h-1 w-full -rotate-45 bg-red" />
            </Fade>
            <Fade
                show={ line !== null }
                className={ line ? winLineClassName(line, index) : '' }
            />
        </div>
    );
};

export default Cell;
