import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import SignInPage from '@/pages/SignInPage';

import PrivateRoute from './PrivateRoute';

const signIn = vi.fn();

vi.mock('convex/react', () => ({
    useConvexAuth: () => ({ isAuthenticated: false, isLoading: false })
}));

vi.mock('@convex-dev/auth/react', () => ({
    useAuthActions: () => ({ signIn })
}));

afterEach(() => {
    cleanup();
    signIn.mockReset();
});

// Review Focus 4: пряме посилання на гру без логіну — після входу Google повертає в ту саму гру
test('sends the original game link, query included, as the sign-in redirect', () => {
    signIn.mockResolvedValue({ signingIn: false });

    render(
        <MemoryRouter initialEntries={ [ '/game/g1?mark=circle' ] }>
            <Routes>
                <Route
                    path="/game/:gameId"
                    element={ <PrivateRoute><p>game page</p></PrivateRoute> }
                />
                <Route
                    path="/login"
                    element={ <SignInPage /> }
                />
            </Routes>
        </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));

    expect(signIn).toHaveBeenCalledWith('google', { redirectTo: `${ window.location.origin }/game/g1?mark=circle` });
});
