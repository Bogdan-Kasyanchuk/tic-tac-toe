import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConvexError } from 'convex/values';
import { Toaster } from 'react-hot-toast';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import NavBar from './NavBar';

const leave = vi.fn();
const signOut = vi.fn();

vi.mock('convex/react', () => ({
    useConvexAuth: () => ({ isAuthenticated: true, isLoading: false }),
    useMutation: () => leave,
    useQuery: () => ({ name: 'Alice', avatar: '' })
}));

vi.mock('@convex-dev/auth/react', () => ({
    useAuthActions: () => ({ signOut })
}));

beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });

    const modalRoot = document.createElement('div');

    modalRoot.id = 'root-modal';
    document.body.append(modalRoot);
});

afterEach(() => {
    cleanup();
    document.getElementById('root-modal')?.remove();
    leave.mockReset();
    signOut.mockReset();
});

// Фінальна рецензія, №3: підтверджений Logout має розлогінити, навіть якщо вихід із гри не вдався
test('signs out after confirming Logout even when leaving the game fails', async () => {
    leave.mockRejectedValue(new ConvexError('Something went wrong'));
    signOut.mockResolvedValue(undefined);

    render(
        <MemoryRouter initialEntries={ [ '/game/g1' ] }>
            <Toaster />
            <NavBar />
        </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ok' }));

    await waitFor(() => {
        expect(leave).toHaveBeenCalledWith({ code: 'g1' });
    });
    await waitFor(() => {
        expect(signOut).toHaveBeenCalledTimes(1);
    });
});
