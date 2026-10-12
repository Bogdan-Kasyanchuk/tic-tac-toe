export type Mark = 'circle' | 'cross';
export type Cell = Mark | '';
export type Line = 'horizontal' | 'vertical' | 'rotate_45' | 'rotate_-45';
export type WinLine = { line: Line, cells: number[] };

export const BOARD_SIZE = 9;
export const ROUND_END_DELAY_MS = 1500;

const LINES: { line: Line, cells: [ number, number, number ] }[] = [
    { line: 'horizontal', cells: [ 0, 1, 2 ] },
    { line: 'horizontal', cells: [ 3, 4, 5 ] },
    { line: 'horizontal', cells: [ 6, 7, 8 ] },
    { line: 'vertical', cells: [ 0, 3, 6 ] },
    { line: 'vertical', cells: [ 1, 4, 7 ] },
    { line: 'vertical', cells: [ 2, 5, 8 ] },
    { line: 'rotate_45', cells: [ 0, 4, 8 ] },
    { line: 'rotate_-45', cells: [ 2, 4, 6 ] }
];

export const emptyBoard = (): Cell[] => Array.from({ length: BOARD_SIZE }, (): Cell => '');

export const otherMark = (mark: Mark): Mark => (mark === 'circle' ? 'cross' : 'circle');

export const findWinLine = (board: Cell[]): WinLine | null => {
    for (const { line, cells } of LINES) {
        const [ a, b, c ] = cells;
        const mark = board[ a ];

        if (mark && mark === board[ b ] && mark === board[ c ]) {
            return { line, cells: [ ...cells ] };
        }
    }

    return null;
};

export const isBoardFull = (board: Cell[]): boolean => board.every(cell => cell !== '');
