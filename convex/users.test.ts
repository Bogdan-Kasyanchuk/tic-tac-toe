import { expect, test } from 'vitest';

import { api } from './_generated/api';
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
        avatar: 'https://example.com/Alice.png'
    });
});
