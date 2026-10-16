import { ConvexError } from 'convex/values';

export const MIN_PASSWORD_LENGTH = 8;

export const EMAIL_TAKEN = 'An account with this email already exists. Sign in instead';
export const EMAIL_LINKED_TO_GOOGLE = 'This email is linked to Google. Continue with Google instead';
export const WRONG_CREDENTIALS = 'Wrong email or password';
export const TOO_MANY_ATTEMPTS = 'Too many attempts. Try again later';

// 'google' — пошта є в users, але без акаунта з паролем: зараз так буває лише після входу через Google
export type EmailStatus = 'free' | 'password' | 'google';

// Один акаунт на адресу незалежно від регістру й випадкових пробілів
export const normalizeEmail = (value: unknown): string => {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new ConvexError('Email is required');
    }

    return value.trim().toLowerCase();
};

export const validatePassword = (password: string) => {
    if (password.length < MIN_PASSWORD_LENGTH) {
        throw new ConvexError(`Password must be at least ${ MIN_PASSWORD_LENGTH } characters`);
    }
};

export const takenEmailMessage = (status: EmailStatus): string | null => {
    if (status === 'password') {
        return EMAIL_TAKEN;
    }

    return status === 'google' ? EMAIL_LINKED_TO_GOOGLE : null;
};
