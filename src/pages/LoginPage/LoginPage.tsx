import { useAuthActions } from '@convex-dev/auth/react';
import type { FC } from 'react';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router';

import Button from '@/components/Button';
import errorMessage from '@/lib/errorMessage';

const LoginPage: FC = () => {
    const { signIn } = useAuthActions();
    const location = useLocation();
    const from = (location.state as { from?: string } | null)?.from ?? '/';

    // Google OAuth іде повним редиректом і повертає на `from` (той самий /game/:id, якщо прийшли з посилання)
    const onLogin = () => {
        signIn('google', { redirectTo: from }).catch((error: unknown) => {
            toast.error(errorMessage(error));
        });
    };

    return (
        <Button
            className="px-8 py-4"
            onClick={ onLogin }
        >
            Login with google
        </Button>
    );
};

export default LoginPage;
