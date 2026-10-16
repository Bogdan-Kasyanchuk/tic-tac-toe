import { MIN_PASSWORD_LENGTH } from '@convex/authRules';

// 0 — замало символів; далі кожен рівень додає різноманітність символів
const passwordStrength = (password: string): 0 | 1 | 2 | 3 => {
    if (password.length < MIN_PASSWORD_LENGTH) {
        return 0;
    }

    const mixed = /[a-z]/i.test(password) && /\d/.test(password);

    if (!mixed) {
        return 1;
    }

    return password.length >= 12 && /[^a-z\d]/i.test(password) ? 3 : 2;
};

export default passwordStrength;
