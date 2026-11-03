// Фронтовий tsconfig бачить цей файл через _generated/api.d.ts, а типів Node, тобто process, у ньому немає
/// <reference types="node" />

import Google from '@auth/core/providers/google';
import { convexAuth } from '@convex-dev/auth/server';

import { redirectUrl } from './authRules';
import { EmailPassword } from './emailPassword';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [ Google, EmailPassword ],
    callbacks: {
        redirect: async ({ redirectTo }) => {
            if (!process.env.SITE_URL) {
                throw new Error('SITE_URL is not set');
            }

            return redirectUrl(redirectTo, process.env.SITE_URL);
        }
    }
});
