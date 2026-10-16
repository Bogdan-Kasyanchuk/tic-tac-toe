import { afterEach, expect, test, vi } from 'vitest';

import { shareInvite } from './invite';

const { success, error } = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock('sonner', () => ({ toast: { success, error } }));

const writeText = vi.fn();

const setNavigator = (share?: (data: ShareData) => Promise<void>) => {
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
};

afterEach(() => {
    writeText.mockReset();
    success.mockReset();
    error.mockReset();
});

test('copies the invite link when the browser cannot share', async () => {
    writeText.mockResolvedValue(undefined);
    setNavigator(undefined);

    await shareInvite('g 1');

    expect(writeText).toHaveBeenCalledWith(`${ window.location.origin }/game/g%201`);
    expect(success).toHaveBeenCalledWith('Invite link copied');
});

test('opens the share sheet when the browser can share', async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    setNavigator(share);

    await shareInvite('g1');

    expect(share).toHaveBeenCalledWith({
        title: 'tic·tac·toe',
        text: 'Join my game of tic·tac·toe',
        url: `${ window.location.origin }/game/g1`
    });
    expect(writeText).not.toHaveBeenCalled();
});

// Review Focus 4: закрите меню «Поділитися» — не помилка
test('stays quiet when the person closes the share sheet', async () => {
    setNavigator(vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError')));

    await shareInvite('g1');

    expect(writeText).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
});
