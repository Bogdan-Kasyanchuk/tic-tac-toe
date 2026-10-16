import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import { internalQuery, query } from './_generated/server';
import type { EmailStatus } from './authRules';

export const me = query({
    args: {},
    handler: async ctx => {
        const userId = await getAuthUserId(ctx);

        if (userId === null) {
            return null;
        }

        const user = await ctx.db.get('users', userId);

        if (!user) {
            return null;
        }

        return {
            name: user.name ?? '',
            email: user.email ?? '',
            avatar: user.image ?? ''
        };
    }
});

// Лише для провайдера пошти: публічного «чи зайнята пошта» немає, щоб адреси не можна було перебирати
export const emailStatus = internalQuery({
    args: { email: v.string() },
    handler: async (ctx, { email }): Promise<EmailStatus> => {
        const account = await ctx.db
            .query('authAccounts')
            .withIndex('providerAndAccountId', q => q.eq('provider', 'password').eq('providerAccountId', email))
            .unique();

        if (account) {
            return 'password';
        }

        const user = await ctx.db
            .query('users')
            .withIndex('email', q => q.eq('email', email))
            .first();

        return user ? 'google' : 'free';
    }
});
