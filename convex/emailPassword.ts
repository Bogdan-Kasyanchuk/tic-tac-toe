import { ConvexCredentials } from '@convex-dev/auth/providers/ConvexCredentials';
import { createAccount, retrieveAccount } from '@convex-dev/auth/server';
import { ConvexError } from 'convex/values';
import { Scrypt } from 'lucia';

import { internal } from './_generated/api';
import type { DataModel } from './_generated/dataModel';
import { TOO_MANY_ATTEMPTS, WRONG_CREDENTIALS, normalizeEmail, takenEmailMessage, validatePassword } from './authRules';

const scrypt = new Scrypt();

// Замість Password: перевірка пошти тут асинхронна, а помилки — ConvexError, які видно й на prod.
// id і Scrypt ті самі, що в Password, тож пізніше перейти на нього можна без міграції акаунтів
export const EmailPassword = ConvexCredentials<DataModel>({
    id: 'password',
    authorize: async (params, ctx) => {
        const email = normalizeEmail(params.email);
        const password = typeof params.password === 'string' ? params.password : '';

        if (params.flow === 'signUp') {
            validatePassword(password);

            const taken = takenEmailMessage(await ctx.runQuery(internal.users.emailStatus, { email }));

            if (taken) {
                throw new ConvexError(taken);
            }

            const name = typeof params.name === 'string' ? params.name.trim() : '';
            const { user } = await createAccount(ctx, {
                provider: 'password',
                account: { id: email, secret: password },
                profile: { email, ...(name ? { name } : {}) }
            });

            return { userId: user._id };
        }

        if (params.flow === 'signIn') {
            // retrieveAccount кидає звичайні Error (InvalidAccountId, InvalidSecret, TooManyFailedAttempts) — на prod їх не видно
            const retrieved = await retrieveAccount(ctx, {
                provider: 'password',
                account: { id: email, secret: password }
            }).catch((error: unknown) => {
                const tooMany = error instanceof Error && error.message.includes('TooManyFailedAttempts');

                throw new ConvexError(tooMany ? TOO_MANY_ATTEMPTS : WRONG_CREDENTIALS);
            });

            if (!retrieved) {
                throw new ConvexError(WRONG_CREDENTIALS);
            }

            return { userId: retrieved.user._id };
        }

        throw new ConvexError('Unsupported sign-in flow');
    },
    crypto: {
        hashSecret: async password => scrypt.hash(password),
        verifySecret: async (password, hash) => scrypt.verify(hash, password)
    }
});
