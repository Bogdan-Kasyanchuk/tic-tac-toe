import { expect, test } from 'vitest';

import { internal } from './_generated/api';
import { emptyBoard } from './rules';
import { setup } from './test.setup';

test('removes only e2e users, with their accounts, sessions and games', async () => {
    const t = setup();
    const ids = await t.run(async ctx => {
        const tester = await ctx.db.insert('users', { name: 'E2E', email: 'e2e-1@e2e.test' });
        const real = await ctx.db.insert('users', { name: 'Alice', email: 'alice@example.com' });
        const session = await ctx.db.insert('authSessions', { userId: tester, expirationTime: Date.now() + 60_000 });

        await ctx.db.insert('authAccounts', { userId: tester, provider: 'password', providerAccountId: 'e2e-1@e2e.test', secret: 'hash' });
        await ctx.db.insert('authAccounts', { userId: real, provider: 'password', providerAccountId: 'alice@example.com', secret: 'hash' });
        await ctx.db.insert('authRefreshTokens', { sessionId: session, expirationTime: Date.now() + 60_000 });
        await ctx.db.insert('games', { code: 'e2e-game', board: emptyBoard(), turn: 'circle', circle: { userId: tester, score: 0 }, cross: null, result: null });
        await ctx.db.insert('games', { code: 'real-game', board: emptyBoard(), turn: 'circle', circle: { userId: real, score: 0 }, cross: null, result: null });

        return { tester, real };
    });

    expect(await t.mutation(internal.testing.deleteE2eUsers, {})).toBe(1);

    await t.run(async ctx => {
        expect(await ctx.db.get('users', ids.tester)).toBeNull();
        expect(await ctx.db.get('users', ids.real)).not.toBeNull();
        expect((await ctx.db.query('authAccounts').collect()).map(account => account.providerAccountId)).toEqual([ 'alice@example.com' ]);
        expect(await ctx.db.query('authSessions').collect()).toHaveLength(0);
        expect(await ctx.db.query('authRefreshTokens').collect()).toHaveLength(0);
        expect((await ctx.db.query('games').collect()).map(game => game.code)).toEqual([ 'real-game' ]);
    });
});
