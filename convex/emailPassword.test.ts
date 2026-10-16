import { Scrypt } from 'lucia';
import { expect, test } from 'vitest';

import { api } from './_generated/api';
import { MAX_PASSWORD_LENGTH, WRONG_CREDENTIALS } from './authRules';
import { setup } from './test.setup';

const signIn = (params: Record<string, string>, t = setup()) => t.action(api.auth.signIn, { provider: 'password', params });

// Пряме звернення до API, повз форму: сервер сам відсіює адресу без формату пошти
test('sign-up refuses a string that is not an email', async () => {
    await expect(signIn({ flow: 'signUp', name: 'Alice', email: 'abc', password: 'tictac2026' })).rejects.toThrow('Enter a valid email');
});

test('sign-up refuses a password longer than the maximum before hashing it', async () => {
    const password = 'a'.repeat(MAX_PASSWORD_LENGTH + 1);

    await expect(signIn({ flow: 'signUp', name: 'Alice', email: 'alice@example.com', password })).rejects.toThrow(`Password must be at most ${ MAX_PASSWORD_LENGTH } characters`);
});

// Вхід теж хешує введений пароль, тож задовгий відсіюється ще до перевірки й не рахується як спроба
test('sign-in refuses a too long password without checking it', async () => {
    const t = setup();
    const secret = await new Scrypt().hash('tictac2026');

    await t.run(async ctx => {
        const userId = await ctx.db.insert('users', { name: 'Alice', email: 'alice@example.com' });

        await ctx.db.insert('authAccounts', { userId, provider: 'password', providerAccountId: 'alice@example.com', secret });
    });

    await expect(signIn({ flow: 'signIn', email: 'alice@example.com', password: 'a'.repeat(MAX_PASSWORD_LENGTH + 1) }, t)).rejects.toThrow(WRONG_CREDENTIALS);
    expect(await t.run(async ctx => ctx.db.query('authRateLimits').collect())).toHaveLength(0);
});
