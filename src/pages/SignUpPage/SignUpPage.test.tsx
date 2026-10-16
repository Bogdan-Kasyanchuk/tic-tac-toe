import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConvexError } from 'convex/values';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import { EMAIL_LINKED_TO_GOOGLE, EMAIL_TAKEN } from '@convex/authRules';

import SignUpPage from './SignUpPage';

const signIn = vi.fn();

vi.mock('@convex-dev/auth/react', () => ({
    useAuthActions: () => ({ signIn })
}));

const renderSignUp = () => render(
    <MemoryRouter initialEntries={ [ { pathname: '/signup', state: { from: '/game/g1' } } ] }>
        <Routes>
            <Route
                path="/signup"
                element={ <SignUpPage /> }
            />
            <Route
                path="/game/:gameId"
                element={ <p>game page</p> }
            />
        </Routes>
    </MemoryRouter>
);

const fill = async (name: string, email: string, password: string) => {
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Name'), name);
    await user.type(screen.getByLabelText('Email'), email);
    await user.type(screen.getByLabelText('Password'), password);
    await user.click(screen.getByRole('button', { name: 'Create account' }));
};

afterEach(() => {
    cleanup();
    signIn.mockReset();
});

test('a short password is rejected before calling the server', async () => {
    renderSignUp();
    await fill('Alice Smith', 'alice@example.com', 'short');

    expect(await screen.findByText('Password must be at least 8 characters')).toBeTruthy();
    expect(signIn).not.toHaveBeenCalled();
});

// Review Focus 3: після реєстрації людина повертається в гру з посилання
test('creates the account and returns to the original page', async () => {
    signIn.mockResolvedValue({ signingIn: true });

    renderSignUp();
    await fill('Alice Smith', 'Alice@Example.com', 'tictac2026');

    expect(signIn).toHaveBeenCalledWith('password', {
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'tictac2026',
        flow: 'signUp'
    });
    expect(await screen.findByText('game page')).toBeTruthy();
});

// Review Focus 1
test('an email with an account says to sign in instead', async () => {
    signIn.mockRejectedValue(new ConvexError(EMAIL_TAKEN));

    renderSignUp();
    await fill('Alice Smith', 'alice@example.com', 'tictac2026');

    expect(await screen.findByText(EMAIL_TAKEN)).toBeTruthy();
    expect(screen.queryByText('game page')).toBeNull();
});

// Review Focus 2
test('an email used with Google says to continue with Google', async () => {
    signIn.mockRejectedValue(new ConvexError(EMAIL_LINKED_TO_GOOGLE));

    renderSignUp();
    await fill('Alice Smith', 'alice@example.com', 'tictac2026');

    expect(await screen.findByText(EMAIL_LINKED_TO_GOOGLE)).toBeTruthy();
});
