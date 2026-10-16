import { internalMutation } from './_generated/server';

export const E2E_EMAIL_DOMAIN = '@e2e.test';

// Прибирання після e2e-тестів і перевірок у браузері. Лише internal: викликається через `npx convex run`, з браузера недоступна
export const deleteE2eUsers = internalMutation({
    args: {},
    handler: async ctx => {
        const users = (await ctx.db.query('users').collect()).filter(user => user.email?.endsWith(E2E_EMAIL_DOMAIN));
        const ids = new Set(users.map(user => user._id));

        for (const game of await ctx.db.query('games').collect()) {
            if ((game.circle && ids.has(game.circle.userId)) || (game.cross && ids.has(game.cross.userId))) {
                await ctx.db.delete('games', game._id);
            }
        }

        for (const user of users) {
            const accounts = await ctx.db.query('authAccounts').withIndex('userIdAndProvider', q => q.eq('userId', user._id)).collect();
            const sessions = await ctx.db.query('authSessions').withIndex('userId', q => q.eq('userId', user._id)).collect();

            for (const account of accounts) {
                await ctx.db.delete('authAccounts', account._id);
            }

            for (const session of sessions) {
                const tokens = await ctx.db.query('authRefreshTokens').withIndex('sessionId', q => q.eq('sessionId', session._id)).collect();

                for (const token of tokens) {
                    await ctx.db.delete('authRefreshTokens', token._id);
                }

                await ctx.db.delete('authSessions', session._id);
            }

            await ctx.db.delete('users', user._id);
        }

        return users.length;
    }
});
