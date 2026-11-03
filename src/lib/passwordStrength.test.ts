import { expect, test } from 'vitest';

import passwordStrength from './passwordStrength';

test.each([
    [ 'short', 0 ],
    [ 'onlyletters', 1 ],
    [ 'tictac2026', 2 ],
    [ 'tic-tac-2026!', 3 ]
] as const)('%s has strength %i', (password, strength) => {
    expect(passwordStrength(password)).toBe(strength);
});
