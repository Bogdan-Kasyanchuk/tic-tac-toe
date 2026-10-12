import { describe, expect, test } from 'vitest';

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
