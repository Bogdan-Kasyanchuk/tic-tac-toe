import { afterEach, describe, expect, test, vi } from 'vitest';

import { api } from './_generated/api';
import { emptyBoard } from './rules';
import { asUser, setup } from './test.setup';

const CODE = 'game-1';

const startGame = async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');
    const bob = await asUser(t, 'Bob');

    await alice.client.mutation(api.games.enter, { code: CODE, mark: 'circle' });
    await bob.client.mutation(api.games.enter, { code: CODE });

    return { t, alice, bob };
};

afterEach(() => {
    vi.useRealTimers();
});

type Started = Awaited<ReturnType<typeof startGame>>;

// Alice — circle і ходить першою; далі ходи чергуються
const play = async ({ alice, bob }: Started, cells: number[]) => {
    for (const [ index, cell ] of cells.entries()) {
        const player = index % 2 === 0 ? alice : bob;

        await player.client.mutation(api.games.makeMove, { code: CODE, cell });
    }
};

describe('enter', () => {
    test('creates a game with the creator in the chosen slot', async () => {
        const t = setup();
        const alice = await asUser(t, 'Alice');

        expect(await alice.client.mutation(api.games.enter, { code: CODE, mark: 'cross' })).toBe('created');
        expect(await alice.client.query(api.games.get, { code: CODE })).toEqual({
            code: CODE,
            board: emptyBoard(),
            turn: 'circle',
            result: null,
            me: 'cross',
            circle: null,
            cross: { name: 'Alice', avatar: 'https://example.com/Alice.png', score: 0 }
        });
    });

    test('rejects anonymous callers and malformed codes', async () => {
        const t = setup();
        const alice = await asUser(t, 'Alice');

        await expect(t.mutation(api.games.enter, { code: CODE, mark: 'circle' }))
            .rejects.toThrow('Not authenticated');
        await expect(alice.client.mutation(api.games.enter, { code: 'bad code!', mark: 'circle' }))
            .rejects.toThrow('Invalid game ID');
    });

    test('rejects an unknown code without a mark', async () => {
        const t = setup();
        const alice = await asUser(t, 'Alice');

        await expect(alice.client.mutation(api.games.enter, { code: CODE })).rejects.toThrow('Not game');
    });

    test('puts the second player into the free slot', async () => {
        const { bob } = await startGame();
        const game = await bob.client.query(api.games.get, { code: CODE });

        expect(game?.me).toBe('cross');
        expect(game?.circle?.name).toBe('Alice');
        expect(game?.cross?.name).toBe('Bob');
    });

    // Review Focus 1: той самий акаунт у двох вкладках
    test('returns already for a player who is in the game and keeps the other slot free', async () => {
        const t = setup();
        const alice = await asUser(t, 'Alice');

        await alice.client.mutation(api.games.enter, { code: CODE, mark: 'circle' });

        expect(await alice.client.mutation(api.games.enter, { code: CODE })).toBe('already');
        expect((await alice.client.query(api.games.get, { code: CODE }))?.cross).toBeNull();
    });

    test('rejects a third player', async () => {
        const { t } = await startGame();
        const carol = await asUser(t, 'Carol');

        await expect(carol.client.mutation(api.games.enter, { code: CODE }))
            .rejects.toThrow('Maximum number of players');
    });
});

describe('get', () => {
    test('hides the game from anonymous visitors, outsiders and unknown codes', async () => {
        const { t } = await startGame();
        const carol = await asUser(t, 'Carol');

        expect(await t.query(api.games.get, { code: CODE })).toBeNull();
        expect(await carol.client.query(api.games.get, { code: CODE })).toBeNull();
        expect(await carol.client.query(api.games.get, { code: 'missing' })).toBeNull();
    });
});

describe('makeMove', () => {
    test('rejects a move before the second player joins', async () => {
        const t = setup();
        const alice = await asUser(t, 'Alice');

        await alice.client.mutation(api.games.enter, { code: CODE, mark: 'circle' });

        await expect(alice.client.mutation(api.games.makeMove, { code: CODE, cell: 0 }))
            .rejects.toThrow('Waiting for the second player');
    });

    test('rejects outsiders, moves out of turn and invalid cells', async () => {
        const game = await startGame();
        const carol = await asUser(game.t, 'Carol');

        await expect(carol.client.mutation(api.games.makeMove, { code: CODE, cell: 0 }))
            .rejects.toThrow('Not a player');
        await expect(game.bob.client.mutation(api.games.makeMove, { code: CODE, cell: 0 }))
            .rejects.toThrow('Not your turn');

        await play(game, [ 0 ]);

        await expect(game.alice.client.mutation(api.games.makeMove, { code: CODE, cell: 1 }))
            .rejects.toThrow('Not your turn');

        for (const cell of [ 0, 9, -1, 1.5 ]) {
            await expect(game.bob.client.mutation(api.games.makeMove, { code: CODE, cell }))
                .rejects.toThrow('Invalid move');
        }
    });

    test('places the mark and passes the turn', async () => {
        const game = await startGame();

        await play(game, [ 4 ]);

        const state = await game.alice.client.query(api.games.get, { code: CODE });

        expect(state?.board[ 4 ]).toBe('circle');
        expect(state?.turn).toBe('cross');
        expect(state?.result).toBeNull();
    });

    test('ends the round on a win and resets the board after the delay', async () => {
        vi.useFakeTimers();

        const game = await startGame();

        await play(game, [ 0, 3, 1, 4, 2 ]);

        const won = await game.alice.client.query(api.games.get, { code: CODE });

        expect(won?.result).toEqual({ kind: 'win', mark: 'circle', line: 'horizontal', cells: [ 0, 1, 2 ] });
        expect(won?.circle?.score).toBe(1);
        await expect(game.bob.client.mutation(api.games.makeMove, { code: CODE, cell: 8 }))
            .rejects.toThrow('Round is over');

        await game.t.finishAllScheduledFunctions(vi.runAllTimers);

        const next = await game.alice.client.query(api.games.get, { code: CODE });

        expect(next?.board).toEqual(emptyBoard());
        expect(next?.result).toBeNull();
        expect(next?.turn).toBe('circle');
        expect(next?.circle?.score).toBe(1);
    });

    test('ends the round on a draw without scoring', async () => {
        vi.useFakeTimers();

        const game = await startGame();

        await play(game, [ 0, 1, 2, 4, 3, 5, 7, 6, 8 ]);

        const drawn = await game.alice.client.query(api.games.get, { code: CODE });

        expect(drawn?.result).toEqual({ kind: 'draw' });
        expect(drawn?.circle?.score).toBe(0);
        expect(drawn?.cross?.score).toBe(0);

        await game.t.finishAllScheduledFunctions(vi.runAllTimers);

        expect((await game.alice.client.query(api.games.get, { code: CODE }))?.board).toEqual(emptyBoard());
    });
});

describe('clearBoard and newSession', () => {
    test('clear keeps the scores', async () => {
        const game = await startGame();

        await play(game, [ 0, 3, 1, 4, 2 ]);
        await game.bob.client.mutation(api.games.clearBoard, { code: CODE });

        const state = await game.alice.client.query(api.games.get, { code: CODE });

        expect(state?.board).toEqual(emptyBoard());
        expect(state?.result).toBeNull();
        expect(state?.circle?.score).toBe(1);
    });

    // Review Focus 2: Clear у вікні 1.5 с після перемоги
    test('the scheduled reset does not wipe a round started after Clear', async () => {
        vi.useFakeTimers();

        const game = await startGame();

        await play(game, [ 0, 3, 1, 4, 2 ]);
        await game.alice.client.mutation(api.games.clearBoard, { code: CODE });
        await play(game, [ 4 ]);
        await game.t.finishAllScheduledFunctions(vi.runAllTimers);

        expect((await game.alice.client.query(api.games.get, { code: CODE }))?.board[ 4 ]).toBe('circle');
    });

    // Відкладена дрібниця №1: скид від першої перемоги не має завершити наступний раунд раніше часу
    test('a stale scheduled reset does not cut short a round that ended after Clear', async () => {
        vi.useFakeTimers();

        const game = await startGame();

        await play(game, [ 0, 3, 1, 4, 2 ]);
        vi.advanceTimersByTime(1000);
        await game.alice.client.mutation(api.games.clearBoard, { code: CODE });
        await play(game, [ 0, 3, 1, 4, 2 ]);

        // Скид першого раунду (на 1500 мс) уже настав, другого (на 2500 мс) — ще ні
        vi.advanceTimersByTime(600);
        await game.t.finishInProgressScheduledFunctions();

        const state = await game.alice.client.query(api.games.get, { code: CODE });

        expect(state?.result).toEqual({ kind: 'win', mark: 'circle', line: 'horizontal', cells: [ 0, 1, 2 ] });
        expect(state?.circle?.score).toBe(2);
    });

    test('new session resets the scores', async () => {
        const game = await startGame();

        await play(game, [ 0, 3, 1, 4, 2 ]);
        await game.alice.client.mutation(api.games.newSession, { code: CODE });

        const state = await game.alice.client.query(api.games.get, { code: CODE });

        expect(state?.circle?.score).toBe(0);
        expect(state?.cross?.score).toBe(0);
        expect(state?.board).toEqual(emptyBoard());
    });

    test('outsiders cannot clear or restart', async () => {
        const { t } = await startGame();
        const carol = await asUser(t, 'Carol');

        await expect(carol.client.mutation(api.games.clearBoard, { code: CODE })).rejects.toThrow('Not a player');
        await expect(carol.client.mutation(api.games.newSession, { code: CODE })).rejects.toThrow('Not a player');
    });
});

describe('leave', () => {
    // Review Focus 3: суперник виходить посеред раунду
    test('frees the slot, resets the round and the scores, and blocks the leaver', async () => {
        const game = await startGame();

        await play(game, [ 0, 3, 1, 4, 2 ]);
        await game.bob.client.mutation(api.games.leave, { code: CODE });

        const state = await game.alice.client.query(api.games.get, { code: CODE });

        expect(state?.cross).toBeNull();
        expect(state?.circle?.score).toBe(0);
        expect(state?.board).toEqual(emptyBoard());
        expect(await game.bob.client.query(api.games.get, { code: CODE })).toBeNull();
        await expect(game.bob.client.mutation(api.games.makeMove, { code: CODE, cell: 0 }))
            .rejects.toThrow('Not a player');

        const carol = await asUser(game.t, 'Carol');

        expect(await carol.client.mutation(api.games.enter, { code: CODE })).toBe('joined');
    });

    test('deletes the game when the last player leaves', async () => {
        const t = setup();
        const alice = await asUser(t, 'Alice');

        await alice.client.mutation(api.games.enter, { code: CODE, mark: 'circle' });
        await alice.client.mutation(api.games.leave, { code: CODE });

        await expect(alice.client.mutation(api.games.enter, { code: CODE })).rejects.toThrow('Not game');
    });

    test('ignores unknown games', async () => {
        const t = setup();
        const alice = await asUser(t, 'Alice');

        await expect(alice.client.mutation(api.games.leave, { code: 'missing' })).resolves.toBeNull();
    });
});
