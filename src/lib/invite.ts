import { toast } from 'sonner';

export const inviteLink = (code: string) => `${ window.location.origin }/game/${ encodeURIComponent(code) }`;

export const copyText = async (text: string, success: string) => {
    try {
        await navigator.clipboard.writeText(text);
        toast.success(success);
    } catch {
        toast.error('Could not copy. Select the text and copy it manually');
    }
};

// Телефон: системне меню «Поділитися»; браузер без Web Share отримує копію лінка
export const shareInvite = async (code: string) => {
    const url = inviteLink(code);

    if (typeof navigator.share !== 'function') {
        await copyText(url, 'Invite link copied');

        return;
    }

    try {
        await navigator.share({ title: 'tic·tac·toe', text: 'Join my game of tic·tac·toe', url });
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            return;
        }

        await copyText(url, 'Invite link copied');
    }
};
