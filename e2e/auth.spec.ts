import { type Page, expect, test } from '@playwright/test';

import { EMAIL_TAKEN, WRONG_CREDENTIALS } from '../convex/authRules';

import { PASSWORD, chooseMenuItem, fillSignUp, isPhone, signUp, testEmail } from './helpers';

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

// Від 768 до 1024 панель вузька: відступи 40, а заголовок плавно росте від 42 до 52, щоб не рвати рядки
test('the sign-in panel scales between tablet and desktop', async ({ page }) => {
    test.skip(isPhone(), 'панелі на телефоні немає');

    const heading = page.getByRole('heading', { level: 1 });
    const panel = page.locator('section').filter({ has: heading });
    const check = async (width: number, size: string, padding: string) => {
        await page.setViewportSize({ width, height: 900 });
        await expect(heading).toHaveCSS('font-size', size);
        await expect(panel).toHaveCSS('padding-left', padding);
    };

    await page.goto('/login');

    await check(768, '42px', '40px');
    await check(896, '47px', '40px');
    await check(1024, '52px', '60px');
    await check(1280, '52px', '60px');
});
