import { expect, test } from 'vitest';

import {
    EMAIL_LINKED_TO_GOOGLE, EMAIL_TAKEN, MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, normalizeEmail, signUpError, takenEmailMessage, validatePassword
} from './authRules';

test('passwords shorter than the minimum are rejected', () => {
    expect(() => {
        validatePassword('a'.repeat(MIN_PASSWORD_LENGTH - 1));
    }).toThrow('Password must be at least 8 characters');
});

test('a password of exactly the minimum length is accepted', () => {
    expect(() => {
        validatePassword('a'.repeat(MIN_PASSWORD_LENGTH));
    }).not.toThrow();
});

test('emails are trimmed and lowercased', () => {
    expect(normalizeEmail('  Alice@Example.COM ')).toBe('alice@example.com');
});

test('a missing email is rejected', () => {
    expect(() => normalizeEmail(undefined)).toThrow('Email is required');
});

test('a taken email gets a message that says how to get in', () => {
    expect(takenEmailMessage('free')).toBeNull();
    expect(takenEmailMessage('password')).toBe(EMAIL_TAKEN);
    expect(takenEmailMessage('google')).toBe(EMAIL_LINKED_TO_GOOGLE);
    expect(EMAIL_TAKEN).toBe('An account with this email already exists. Sign in instead');
    expect(EMAIL_LINKED_TO_GOOGLE).toBe('This email is linked to Google. Continue with Google instead');
});

test('passwords longer than the maximum are rejected', () => {
    expect(() => {
        validatePassword('a'.repeat(MAX_PASSWORD_LENGTH + 1));
    }).toThrow('Password must be at most 128 characters');
});

test('a password of exactly the maximum length is accepted', () => {
    expect(() => {
        validatePassword('a'.repeat(MAX_PASSWORD_LENGTH));
    }).not.toThrow();
});

test.each([ 'abc', 'abc@', '@example.com', 'a b@example.com', 'alice@example' ])('%s is not an email', value => {
    expect(() => normalizeEmail(value)).toThrow('Enter a valid email');
});

// Дві одночасні реєстрації: обидві пройшли перевірку, друга падає в createAccount звичайним Error
test('a duplicate account error from Convex Auth becomes the taken-email message', () => {
    expect(signUpError(new Error('Uncaught Error: Account alice@example.com already exists'))).toMatchObject({ data: EMAIL_TAKEN });
});

test('any other sign-up error passes through unchanged', () => {
    const error = new Error('Something else');

    expect(signUpError(error)).toBe(error);
});
