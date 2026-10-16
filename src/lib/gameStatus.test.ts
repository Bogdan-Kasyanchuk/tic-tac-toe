import { expect, test } from 'vitest';

import type { GameView } from '@/types/game';

import { canMove, gameStatus } from './gameStatus';

const GAME: GameView = {
    code: 'g1',
    board: [ '', '', '', '', '', '', '', '', '' ],
    turn: 'circle',
    result: null,
    me: 'circle',
    circle: { name: 'Alex Kim', avatar: '', score: 2 },
    cross: { name: 'Sam Moreno', avatar: '', score: 1 }
};

test('my turn', () => {
    expect(gameStatus(GAME)).toEqual({ text: 'Your turn', hint: 'Tap an empty cell', tone: 'circle', waiting: false });
    expect(canMove(GAME)).toBe(true);
});

test('the opponent turn names them and locks the board', () => {
    const game: GameView = { ...GAME, turn: 'cross' };

    expect(gameStatus(game)).toEqual({
        text: 'Sam\'s turn',
        hint: 'Waiting for their move. The board unlocks on your turn.',
        tone: 'cross',
        waiting: true
    });
    expect(canMove(game)).toBe(false);
});

test('a round I won', () => {
    const game: GameView = { ...GAME, result: { kind: 'win', mark: 'circle', line: 'rotate_45', cells: [ 0, 4, 8 ] } };

    expect(gameStatus(game).text).toBe('You take the round');
    expect(gameStatus(game).hint).toBe('Next round starts in a moment');
    expect(canMove(game)).toBe(false);
});

test('a round the opponent won', () => {
    const game: GameView = { ...GAME, result: { kind: 'win', mark: 'cross', line: 'vertical', cells: [ 1, 4, 7 ] } };

    expect(gameStatus(game)).toMatchObject({ text: 'Sam takes the round', tone: 'cross' });
});

test('a draw', () => {
    expect(gameStatus({ ...GAME, result: { kind: 'draw' } })).toMatchObject({ text: 'Draw. Nobody takes this one', tone: 'muted' });
});

test('no moves while waiting for the second player', () => {
    expect(canMove({ ...GAME, cross: null })).toBe(false);
});

// Артборд Waiting: поки суперника немає, це не «Your turn»
test('alone in the game, the status says it waits for a second player', () => {
    expect(gameStatus({ ...GAME, cross: null })).toEqual({ text: 'Waiting for a second player', hint: null, tone: 'muted', waiting: false });
});
