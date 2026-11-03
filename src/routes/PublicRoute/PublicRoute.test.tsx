import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import PublicRoute from './PublicRoute';

vi.mock('convex/react', () => ({
    useConvexAuth: () => ({ isAuthenticated: true, isLoading: false })
}));

afterEach(() => {
    cleanup();
});

// Review Focus 3: після входу поштою людина йде туди, звідки прийшла, а не в лобі
test('a signed-in visitor on an auth page goes back to where they came from', () => {
    render(
        <MemoryRouter initialEntries={ [ { pathname: '/login', state: { from: '/game/g1' } } ] }>
            <Routes>
                <Route
                    path="/login"
                    element={ <PublicRoute restricted><p>login page</p></PublicRoute> }
                />
                <Route
                    path="/game/:gameId"
                    element={ <p>game page</p> }
                />
            </Routes>
        </MemoryRouter>
    );

    expect(screen.getByText('game page')).toBeTruthy();
});
