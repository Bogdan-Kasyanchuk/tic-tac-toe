import { ConvexError } from 'convex/values';

export const MIN_PASSWORD_LENGTH = 8;
// Пароль хешується Scrypt і при реєстрації, і при вході: без межі сервер хешував би рядок будь-якої довжини
export const MAX_PASSWORD_LENGTH = 128;

export const EMAIL_TAKEN = 'An account with this email already exists. Sign in instead';
export const EMAIL_LINKED_TO_GOOGLE = 'This email is linked to Google. Continue with Google instead';
export const WRONG_CREDENTIALS = 'Wrong email or password';
export const TOO_MANY_ATTEMPTS = 'Too many attempts. Try again later';

// 'google' — пошта є в users, але без акаунта з паролем: зараз так буває лише після входу через Google
export type EmailStatus = 'free' | 'password' | 'google';

// Та сама груба перевірка, що й у формі: щось@щось.щось без пробілів
const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Один акаунт на адресу незалежно від регістру й випадкових пробілів
export const normalizeEmail = (value: unknown): string => {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new ConvexError('Email is required');
    }

    const email = value.trim().toLowerCase();

    if (!EMAIL_FORMAT.test(email)) {
        throw new ConvexError('Enter a valid email');
    }

    return email;
};

export const validatePassword = (password: string) => {
    if (password.length < MIN_PASSWORD_LENGTH) {
        throw new ConvexError(`Password must be at least ${ MIN_PASSWORD_LENGTH } characters`);
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
        throw new ConvexError(`Password must be at most ${ MAX_PASSWORD_LENGTH } characters`);
    }
};

// Дві одночасні реєстрації на одну пошту обидві проходять перевірку, і друга падає в createAccount звичайним Error,
// який на prod прихований. Віддаємо їй той самий текст, що й при послідовній реєстрації
export const signUpError = (error: unknown): unknown => {
    if (error instanceof Error && error.message.includes('already exists')) {
        return new ConvexError(EMAIL_TAKEN);
    }

    return error;
};

export const takenEmailMessage = (status: EmailStatus): string | null => {
    if (status === 'password') {
        return EMAIL_TAKEN;
    }

    return status === 'google' ? EMAIL_LINKED_TO_GOOGLE : null;
};
