import { expect, test } from 'vitest';

import { api, internal } from './_generated/api';
import { asUser, setup } from './test.setup';

test('me returns null for an anonymous visitor', async () => {
    const t = setup();

    expect(await t.query(api.users.me, {})).toBeNull();
});

test('me returns the name and avatar of the signed-in user', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');

    expect(await alice.client.query(api.users.me, {})).toEqual({
        name: 'Alice',
        email: 'alice@example.com',
        avatar: 'https://example.com/Alice.png'
    });
});

test('a fresh email is free', async () => {
    const t = setup();

    expect(await t.query(internal.users.emailStatus, { email: 'nobody@example.com' })).toBe('free');
});

// Review Focus 1: пошта з паролем уже зайнята
test('an email with a password account is taken', async () => {
    const t = setup();
    const alice = await asUser(t, 'Alice');

    await t.run(async ctx => {
        await ctx.db.insert('authAccounts', {
            userId: alice.userId,
            provider: 'password',
            providerAccountId: 'alice@example.com',
            secret: 'hash'
        });
    });

    expect(await t.query(internal.users.emailStatus, { email: 'alice@example.com' })).toBe('password');
});

// Review Focus 2: людина з Google не отримує другого акаунта на ту саму пошту
test('an email known only from Google sign-in points to Google', async () => {
    const t = setup();

    await asUser(t, 'Alice');

    expect(await t.query(internal.users.emailStatus, { email: 'alice@example.com' })).toBe('google');
});
