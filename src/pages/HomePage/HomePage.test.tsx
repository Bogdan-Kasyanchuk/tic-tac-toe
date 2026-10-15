import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Toaster } from 'react-hot-toast';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import HomePage from './HomePage';

beforeEach(() => {
    // react-hot-toast читає prefers-reduced-motion, а в jsdom matchMedia немає
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});

afterEach(() => {
    cleanup();
});

// Відкладена дрібниця №2: ID, введений на вкладці Join, не стає ID нової гри
test('switching between Join and New game clears the game ID', async () => {
    render(
        <MemoryRouter initialEntries={ [ '/' ] }>
            <Toaster />
            <Routes>
                <Route
                    path="/"
                    element={ <HomePage /> }
                />
                <Route
                    path="/game/:gameId"
                    element={ <p>game page</p> }
                />
            </Routes>
        </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText('Join the game'));
    fireEvent.change(screen.getByPlaceholderText('Enter the game ID'), { target: { value: 'someone-elses-game' } });
    fireEvent.click(screen.getByLabelText('New game'));
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));

    expect(await screen.findByText('Generate Game ID first')).toBeTruthy();
    expect(screen.queryByText('game page')).toBeNull();
});
