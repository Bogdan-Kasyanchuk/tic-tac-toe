import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConvexError } from 'convex/values';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import { Toaster } from '@/components/ui/sonner';
import { mockViewport } from '@/test/viewport';

import AppHeader from './AppHeader';

const leave = vi.fn();
const signOut = vi.fn();

vi.mock('convex/react', () => ({
    useMutation: () => leave,
    useQuery: () => ({ name: 'Alice Smith', email: 'alice@example.com', avatar: '' })
}));

vi.mock('@convex-dev/auth/react', () => ({
    useAuthActions: () => ({ signOut })
}));

const renderAt = (path: string) => render(
    <MemoryRouter initialEntries={ [ path ] }>
        <Toaster />
        <Routes>
            <Route
                path="/"
                element={ <><AppHeader /><p>lobby page</p></> }
            />
            <Route
                path="/game/:gameId"
                element={ <><AppHeader /><p>game page</p></> }
            />
        </Routes>
    </MemoryRouter>
);

afterEach(() => {
    cleanup();
    leave.mockReset();
    signOut.mockReset();
});

// Перенесено з NavBar.test: підтверджений вихід розлогінює, навіть якщо вихід із гри не вдався
test('signs out after confirming even when leaving the game fails', async () => {
    mockViewport(true);
    leave.mockRejectedValue(new ConvexError('Something went wrong'));
    signOut.mockResolvedValue(undefined);

    const user = userEvent.setup();

    renderAt('/game/g1');

    await user.click(screen.getByRole('button', { name: /Alice Smith/ }));
    await user.click(await screen.findByRole('menuitem', { name: 'Sign out' }));
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));

    await waitFor(() => {
        expect(leave).toHaveBeenCalledWith({ code: 'g1' });
    });
    await waitFor(() => {
        expect(signOut).toHaveBeenCalledTimes(1);
    });
});

test('signs out from the lobby without asking, since there is no game to end', async () => {
    mockViewport(true);
    signOut.mockResolvedValue(undefined);

    const user = userEvent.setup();

    renderAt('/');

    await user.click(screen.getByRole('button', { name: /Alice Smith/ }));
    await user.click(await screen.findByRole('menuitem', { name: 'Sign out' }));

    await waitFor(() => {
        expect(signOut).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(leave).not.toHaveBeenCalled();
});

// Review Focus 5: логотип посеред гри не кидає місце в грі без підтвердження
test('asks before leaving the game through the logo', async () => {
    mockViewport(true);
    leave.mockResolvedValue(null);

    const user = userEvent.setup();

    renderAt('/game/g1');

    await user.click(screen.getByRole('link', { name: 'tic·tac·toe home' }));

    const dialog = await screen.findByRole('alertdialog');

    expect(within(dialog).getByText('Leave the game?')).toBeTruthy();
    expect(screen.getByText('game page')).toBeTruthy();

    await user.click(within(dialog).getByRole('button', { name: 'Leave game' }));

    expect(await screen.findByText('lobby page')).toBeTruthy();
    expect(leave).toHaveBeenCalledWith({ code: 'g1' });
});

test('the phone menu offers to share the invite link', async () => {
    const user = userEvent.setup();

    renderAt('/game/g1');

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(await screen.findByRole('button', { name: /Share invite link/ })).toBeTruthy();
    expect(screen.getByText('g1')).toBeTruthy();
    expect(screen.getByText('Alice Smith')).toBeTruthy();
});
