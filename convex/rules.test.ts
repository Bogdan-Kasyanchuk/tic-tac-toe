import { describe, expect, test } from 'vitest';

import { type Cell, emptyBoard, findWinLine, isBoardFull, otherMark } from './rules';

// 'o' — circle, 'x' — cross, '.' — порожньо
const board = (cells: string): Cell[] => [ ...cells ].map(char => {
    if (char === 'o') {
        return 'circle';
    }

    return char === 'x' ? 'cross' : '';
});

const DRAW = 'oxooxxxoo';

describe('emptyBoard', () => {
    test('has nine empty cells', () => {
        expect(emptyBoard()).toEqual([ '', '', '', '', '', '', '', '', '' ]);
    });
});

describe('otherMark', () => {
    test('switches the mark', () => {
        expect(otherMark('circle')).toBe('cross');
        expect(otherMark('cross')).toBe('circle');
    });
});

describe('findWinLine', () => {
    test.each([
        [ 'ooo......', 'horizontal', [ 0, 1, 2 ] ],
        [ '...xxx...', 'horizontal', [ 3, 4, 5 ] ],
        [ '......ooo', 'horizontal', [ 6, 7, 8 ] ],
        [ 'x..x..x..', 'vertical', [ 0, 3, 6 ] ],
        [ '.o..o..o.', 'vertical', [ 1, 4, 7 ] ],
        [ '..x..x..x', 'vertical', [ 2, 5, 8 ] ],
        [ 'o...o...o', 'rotate_45', [ 0, 4, 8 ] ],
        [ '..x.x.x..', 'rotate_-45', [ 2, 4, 6 ] ]
    ])('%s wins by %s', (cells, line, winning) => {
        expect(findWinLine(board(cells))).toEqual({ line, cells: winning });
    });

    test('returns the first line in order when two lines are complete', () => {
        expect(findWinLine(board('oooo..o..'))).toEqual({ line: 'horizontal', cells: [ 0, 1, 2 ] });
    });

    test('returns null for mixed marks, an empty board and a draw', () => {
        expect(findWinLine(board('oxo......'))).toBeNull();
        expect(findWinLine(emptyBoard())).toBeNull();
        expect(findWinLine(board(DRAW))).toBeNull();
    });
});

describe('isBoardFull', () => {
    test('is true only when every cell is taken', () => {
        expect(isBoardFull(board(DRAW))).toBe(true);
        expect(isBoardFull(board('oxooxxxo.'))).toBe(false);
        expect(isBoardFull(emptyBoard())).toBe(false);
    });
});
