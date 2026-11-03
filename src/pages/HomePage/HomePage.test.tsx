import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation, useParams } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import { Toaster } from '@/components/ui/sonner';

import HomePage from './HomePage';

vi.mock('nanoid', () => ({ nanoid: () => 'fresh-id' }));

vi.mock('convex/react', () => ({
    useQuery: () => ({ name: 'Alex Kim', email: 'alex@example.com', avatar: '' })
}));

const GameProbe = () => <p>{ `game ${ useParams().gameId } ${ useLocation().search }` }</p>;

const renderLobby = () => render(
    <MemoryRouter initialEntries={ [ '/' ] }>
        <Toaster />
        <Routes>
            <Route
                path="/"
                element={ <HomePage /> }
            />
            <Route
                path="/game/:gameId"
                element={ <GameProbe /> }
            />
        </Routes>
    </MemoryRouter>
);

afterEach(() => {
    cleanup();
});

test('greets the player by first name', () => {
    renderLobby();

    expect(screen.getByRole('heading', { name: 'Ready for a round, Alex?' })).toBeTruthy();
});

// Перенесено з відкладеної дрібниці №2: ID, введений на вкладці Join, не стає ID нової гри
test('a game ID typed on Join never becomes the new game ID', async () => {
    const user = userEvent.setup();

    renderLobby();
    await user.click(screen.getByRole('tab', { name: 'Join a game' }));
    await user.type(screen.getByLabelText('Game ID'), 'someone-elses-game');
    await user.click(screen.getByRole('tab', { name: 'New game' }));
    await user.click(screen.getByRole('button', { name: /Create game/ }));

    expect(await screen.findByText('game fresh-id ?mark=circle')).toBeTruthy();
});

test('the chosen mark goes with the new game', async () => {
    const user = userEvent.setup();

    renderLobby();
    await user.click(screen.getByLabelText(/Cross/));
    await user.click(screen.getByRole('button', { name: /Create game/ }));

    expect(await screen.findByText('game fresh-id ?mark=cross')).toBeTruthy();
});

test('joining needs a game ID', async () => {
    const user = userEvent.setup();

    renderLobby();
    await user.click(screen.getByRole('tab', { name: 'Join a game' }));
    await user.click(screen.getByRole('button', { name: /Join game/ }));

    expect(await screen.findByText('Enter the game ID')).toBeTruthy();
});

test('joining trims the ID and keeps it safe in the URL', async () => {
    const user = userEvent.setup();

    renderLobby();
    await user.click(screen.getByRole('tab', { name: 'Join a game' }));
    await user.type(screen.getByLabelText('Game ID'), '  abc def ');
    await user.click(screen.getByRole('button', { name: /Join game/ }));

    expect(await screen.findByText('game abc def')).toBeTruthy();
});

test('the generated ID can be copied', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    // setup() ставить свій стаб буфера обміну, тож мок — після нього
    const user = userEvent.setup();

    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    renderLobby();
    await user.click(screen.getByRole('button', { name: 'Copy game ID' }));

    expect(writeText).toHaveBeenCalledWith('fresh-id');
    expect(await screen.findByText('Game ID copied')).toBeTruthy();
});
