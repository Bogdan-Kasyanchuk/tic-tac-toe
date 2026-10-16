import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, expect, test } from 'vitest';

import { Toaster } from '@/components/ui/sonner';

import HomePage from './HomePage';

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
