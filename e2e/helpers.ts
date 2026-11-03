import { type Browser, type Page, expect, test } from '@playwright/test';

export const PASSWORD = 'tictac2026';

const suffix = () => `${ Date.now() }-${ Math.random().toString(36).slice(2, 7) }`;

export const testEmail = (label: string) => `e2e-${ label }-${ suffix() }@e2e.test`;

export const isPhone = () => test.info().project.name === 'phone';

export const cell = (page: Page, row: number, column: number) => page.getByRole('button', {
    name: new RegExp(`^Row ${ row }, column ${ column }:`)
});

// Окремий контекст — окреме сховище, тобто другий гравець з власною сесією
export const newPlayerPage = async (browser: Browser) => {
    const { baseURL, viewport, userAgent, isMobile, hasTouch, deviceScaleFactor } = test.info().project.use;
    const context = await browser.newContext({ baseURL, viewport, userAgent, isMobile, hasTouch, deviceScaleFactor });

    return context.newPage();
};

export const fillSignUp = async (page: Page, name: string, email: string) => {
    await page.getByLabel('Name').fill(name);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Create account' }).click();
};

export const signUp = async (page: Page, name: string, email = testEmail(name.toLowerCase())) => {
    await page.goto('/signup');
    await fillSignUp(page, name, email);
    await expect(page.getByRole('heading', { name: `Ready for a round, ${ name }?` })).toBeVisible();

    return email;
};

// Десктоп — дропдаун з ім'ям, телефон — бургер-меню
export const chooseMenuItem = async (page: Page, name: string, item: string) => {
    if (isPhone()) {
        await page.getByRole('button', { name: 'Open menu' }).click();
        await page.getByRole('dialog').getByRole('button', { name: item }).click();

        return;
    }

    await page.getByRole('button', { name: new RegExp(name) }).click();
    await page.getByRole('menuitem', { name: item }).click();
};
