import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { FunctionReference } from 'convex/server';
import { getFunctionName } from 'convex/server';
import { ConvexError } from 'convex/values';
import { StrictMode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { Toaster } from '@/components/ui/sonner';
import { mockViewport } from '@/test/viewport';
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

vi.mock('@convex-dev/auth/react', () => ({
    useAuthActions: () => ({ signOut: vi.fn() })
}));

const GAME: GameView = {
    code: 'g1',
    board: [ '', '', '', '', '', '', '', '', '' ],
    turn: 'circle',
    result: null,
    me: 'circle',
    circle: { name: 'Alice Smith', avatar: '', score: 0 },
    cross: { name: 'Bob Stone', avatar: '', score: 0 }
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

    expect(await screen.findByText('Alice Smith')).toBeTruthy();

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

    render(app('/game/g1'));

    expect(await screen.findByText('Alice Smith')).toBeTruthy();

    const cell = screen.getByRole('button', { name: 'Row 2, column 2: empty' });

    fireEvent.click(cell);
    fireEvent.click(cell);

    expect(makeMove).toHaveBeenCalledTimes(1);
    expect(makeMove).toHaveBeenCalledWith({ code: 'g1', cell: 4 });
});

test('locks the board while it is the opponent turn', async () => {
    enter.mockResolvedValue('already');
    queryResult = { ...GAME, turn: 'cross' };

    render(app('/game/g1'));

    expect(await screen.findByText('Bob\'s turn')).toBeTruthy();

    const cells = screen.getAllByRole('button', { name: /^Row \d, column \d/ });

    expect(cells).toHaveLength(9);
    expect(cells.every(cell => (cell as HTMLButtonElement).disabled)).toBe(true);
});

test('highlights the winning cells in the winner colour', async () => {
    enter.mockResolvedValue('already');
    queryResult = {
        ...GAME,
        board: [ 'circle', 'cross', '', 'cross', 'circle', '', '', '', 'circle' ],
        result: { kind: 'win', mark: 'circle', line: 'rotate_45', cells: [ 0, 4, 8 ] }
    };

    render(app('/game/g1'));

    expect(await screen.findByText('You take the round')).toBeTruthy();

    const winning = screen.getAllByRole('button', { name: /circle$/ });

    expect(winning.map(cell => cell.getAttribute('data-win'))).toEqual([ 'circle', 'circle', 'circle' ]);
    expect(screen.getByRole('button', { name: 'Row 1, column 2: cross' }).getAttribute('data-win')).toBeNull();
});

test('alone in the game, the desktop dialog offers the ID and the invite link', async () => {
    mockViewport(true);
    enter.mockResolvedValue('created');
    queryResult = { ...GAME, cross: null };

    render(app('/game/g1'));

    const dialog = await screen.findByRole('dialog', { name: 'Waiting for an opponent' });

    expect(within(dialog).getByText('g1')).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: /Copy invite link/ })).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: 'Cancel and leave' })).toBeTruthy();
});
