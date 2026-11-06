import { toast } from 'sonner';

export const inviteLink = (code: string) => `${ window.location.origin }/game/${ encodeURIComponent(code) }`;

export const copyText = async (text: string, success: string, description?: string) => {
    try {
        await navigator.clipboard.writeText(text);

        if (description) {
            toast.success(success, { description });
        } else {
            toast.success(success);
        }
    } catch {
        toast.error('Could not copy. Select the text and copy it manually');
    }
};

// Тексти toast-а — аркуш Components канвасу, секція Sonner
export const copyInvite = (code: string) => copyText(inviteLink(code), 'Link copied', 'Send it to a friend to start');

// Телефон: системне меню «Поділитися»; браузер без Web Share отримує копію лінка
export const shareInvite = async (code: string) => {
    const url = inviteLink(code);

    if (typeof navigator.share !== 'function') {
        await copyInvite(code);

        return;
    }

    try {
        await navigator.share({ title: 'Tic·Tac·Toe', text: 'Join my game of Tic·Tac·Toe', url });
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            return;
        }

        await copyInvite(code);
    }
};
