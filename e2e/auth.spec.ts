import { type Page, expect, test } from '@playwright/test';

import { EMAIL_TAKEN, WRONG_CREDENTIALS } from '../convex/authRules';

import { PASSWORD, chooseMenuItem, fillSignUp, signUp, testEmail } from './helpers';

const signIn = async (page: Page, email: string, password: string) => {
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
};

test('sign up, sign out and sign in again', async ({ page }) => {
    const email = await signUp(page, 'Alice');

    await chooseMenuItem(page, 'Alice', 'Sign out');
    await expect(page).toHaveURL(/\/login$/);

    await signIn(page, email, PASSWORD);
    await expect(page.getByRole('heading', { name: 'Ready for a round, Alice?' })).toBeVisible();
});

test('a wrong password is refused', async ({ page }) => {
    const email = await signUp(page, 'Alice');

    await chooseMenuItem(page, 'Alice', 'Sign out');
    await signIn(page, email, 'wrong-pass-1');

    await expect(page.getByText(WRONG_CREDENTIALS)).toBeVisible();
});

// Review Focus 1
test('an email can be registered only once', async ({ page }) => {
    const email = await signUp(page, 'Alice');

    await chooseMenuItem(page, 'Alice', 'Sign out');
    // Перезавантаження посеред виходу лишає в браузері токен уже закритої сесії, тож спершу дочекайся /login
    await expect(page).toHaveURL(/\/login$/);
    await page.goto('/signup');
    await fillSignUp(page, 'Alice', email);

    await expect(page.getByText(EMAIL_TAKEN)).toBeVisible();
});

// Review Focus 3
test('a game link survives sign-up', async ({ page }) => {
    const code = `e2e-${ Date.now() }`;

    await page.goto(`/game/${ code }?mark=circle`);
    await expect(page).toHaveURL(/\/login$/);

    await page.getByRole('link', { name: 'Create an account' }).click();
    await fillSignUp(page, 'Alice', testEmail('link'));

    await expect(page).toHaveURL(new RegExp(`/game/${ code }$`));
    await expect(page.getByText('Waiting for an opponent')).toBeVisible();
});
