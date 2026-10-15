import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { FunctionReference } from 'convex/server';
import { getFunctionName } from 'convex/server';
import { ConvexError } from 'convex/values';
import { StrictMode } from 'react';
import { Toaster } from 'react-hot-toast';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { GameView } from '@/types/game';

import GamePage from './GamePage';

const enter = vi.fn();
const makeMove = vi.fn();
const otherMutation = vi.fn();
let queryResult: GameView | null | undefined;

vi.mock('convex/react', () => ({
    useQuery: () => queryResult,
    useMutation: (ref: FunctionReference<'mutation'>) => {
        const name = getFunctionName(ref);

        if (name === 'games:enter') {
            return enter;
        }

        return name === 'games:makeMove' ? makeMove : otherMutation;
    }
}));

const GAME: GameView = {
    code: 'g1',
    board: [ '', '', '', '', '', '', '', '', '' ],
    turn: 'circle',
    result: null,
    me: 'circle',
    circle: { name: 'Alice', avatar: '', score: 0 },
    cross: { name: 'Bob', avatar: '', score: 0 }
};

const app = (path: string) => (
    <StrictMode>
        <MemoryRouter initialEntries={ [ path ] }>
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

beforeEach(() => {
    queryResult = undefined;
    // react-hot-toast читає prefers-reduced-motion, а в jsdom matchMedia немає
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});

afterEach(() => {
    cleanup();
    enter.mockReset();
    makeMove.mockReset();
});

// QA, задача 9, пункт 10: у dev StrictMode запускає ефект входу двічі, і обидва виклики падають
test('shows a single error toast when entering a game fails twice under StrictMode', async () => {
    enter.mockRejectedValue(new ConvexError('Invalid game ID'));

    render(app('/game/abc%20def'));

    await waitFor(() => {
        expect(enter).toHaveBeenCalledTimes(2);
    });
    await act(async () => {
        await Promise.resolve();
    });

    expect(await screen.findAllByText('Invalid game ID')).toHaveLength(1);
});

// Фінальна рецензія, №1: місце звільнили в іншій вкладці — сторінка не має зависнути на спінері
test('goes home when the player loses the seat while the page is open', async () => {
    enter.mockResolvedValue('already');
    queryResult = GAME;

    const view = render(app('/game/g1'));

    expect(await screen.findByText('Alice')).toBeTruthy();

    queryResult = null;
    view.rerender(app('/game/g1'));

    expect(await screen.findByText('home')).toBeTruthy();
    expect(await screen.findByText('Not game')).toBeTruthy();
});

// Review Focus 5: подвійний клік по клітинці — рівно один хід, поки перший ще в дорозі
test('sends a single move on a double click while the first move is in flight', async () => {
    enter.mockResolvedValue('already');
    makeMove.mockReturnValue(new Promise(() => {}));
    queryResult = GAME;

    const { container } = render(app('/game/g1'));

    expect(await screen.findByText('Alice')).toBeTruthy();

    const cell = container.querySelector('.grid-cols-3')!.children[ 4 ];

    fireEvent.click(cell);
    fireEvent.click(cell);

    expect(makeMove).toHaveBeenCalledTimes(1);
    expect(makeMove).toHaveBeenCalledWith({ code: 'g1', cell: 4 });
});
