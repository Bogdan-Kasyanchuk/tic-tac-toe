import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import type { FunctionReference } from 'convex/server';
import { getFunctionName } from 'convex/server';
import { ConvexError } from 'convex/values';
import { StrictMode } from 'react';
import { Toaster } from 'react-hot-toast';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import GamePage from './GamePage';

const enter = vi.fn();

vi.mock('convex/react', () => ({
    useQuery: () => undefined,
    useMutation: (ref: FunctionReference<'mutation'>) => (getFunctionName(ref) === 'games:enter' ? enter : vi.fn())
}));

beforeEach(() => {
    // react-hot-toast читає prefers-reduced-motion, а в jsdom matchMedia немає
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});

afterEach(() => {
    cleanup();
    enter.mockReset();
});

// QA, задача 9, пункт 10: у dev StrictMode запускає ефект входу двічі, і обидва виклики падають
test('shows a single error toast when entering a game fails twice under StrictMode', async () => {
    enter.mockRejectedValue(new ConvexError('Invalid game ID'));

    render(
        <StrictMode>
            <MemoryRouter initialEntries={ [ '/game/abc%20def' ] }>
                <Toaster />
                <Routes>
                    <Route
                        path="/game/:gameId"
                        element={ <GamePage /> }
                    />
                    <Route
                        path="/"
                        element={ <p>home</p> }
                    />
                </Routes>
            </MemoryRouter>
        </StrictMode>
    );

    await waitFor(() => {
        expect(enter).toHaveBeenCalledTimes(2);
    });
    await act(async () => {
        await Promise.resolve();
    });

    expect(await screen.findAllByText('Invalid game ID')).toHaveLength(1);
});
