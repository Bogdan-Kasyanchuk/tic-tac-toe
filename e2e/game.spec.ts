import { expect, test } from '@playwright/test';

import { cell, chooseMenuItem, newPlayerPage, signUp } from './helpers';

test('two players join through the lobby, win a round, draw one and leave', async ({ page, browser }) => {
    const bob = await newPlayerPage(browser);

    await signUp(page, 'Alice');
    await signUp(bob, 'Bob');

    // Alice створює гру з лобі; ID беремо з адреси, куди її перекинуло
    await page.getByRole('button', { name: /Create game/ }).click();
    await expect(page.getByText('Waiting for an opponent')).toBeVisible();

    const code = decodeURIComponent(new URL(page.url()).pathname.split('/').pop() ?? '');

    await bob.getByRole('tab', { name: 'Join a game' }).click();
    await bob.getByLabel('Game ID').fill(code);
    await bob.getByRole('button', { name: /Join game/ }).click();

    await expect(page.getByText('Waiting for an opponent')).toBeHidden();
    await expect(page.getByText('Your turn')).toBeVisible();
    await expect(bob.getByText('Alice\'s turn')).toBeVisible();
    await expect(cell(bob, 2, 2)).toBeDisabled();

    // Виграш Alice першим рядком
    await cell(page, 1, 1).click();
    await cell(bob, 2, 1).click();
    await cell(page, 1, 2).click();
    await cell(bob, 2, 2).click();
    await cell(page, 1, 3).click();

    await expect(page.getByText('You take the round')).toBeVisible();
    await expect(bob.getByText('Alice takes the round')).toBeVisible();
    await expect(cell(page, 1, 1)).toHaveAttribute('data-win', 'circle');

    // Після паузи поле очищається, і нолик знову ходить першим
    await expect(cell(page, 1, 1)).toHaveAccessibleName(/empty$/);
    await expect(page.getByText('Your turn')).toBeVisible();

    // Нічия: O X O / O X X / X O O
    for (const [ player, row, column ] of [
        [ page, 1, 1 ], [ bob, 1, 2 ], [ page, 1, 3 ], [ bob, 2, 2 ], [ page, 2, 1 ],
        [ bob, 3, 1 ], [ page, 3, 2 ], [ bob, 2, 3 ], [ page, 3, 3 ]
    ] as const) {
        await cell(player, row, column).click();
    }

    await expect(page.getByText('Draw. Nobody takes this one')).toBeVisible();

    // Bob іде в лобі — у Alice знову очікування суперника
    await chooseMenuItem(bob, 'Bob', 'Back to lobby');
    await bob.getByRole('alertdialog').getByRole('button', { name: 'Leave game' }).click();

    await expect(bob.getByRole('heading', { name: 'Ready for a round, Bob?' })).toBeVisible();
    await expect(page.getByText('Waiting for an opponent')).toBeVisible();

    await bob.context().close();
});
