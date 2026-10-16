import { useAuthActions } from '@convex-dev/auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { type FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { z } from 'zod';

import AuthSplitLayout from '@/components/AuthSplitLayout';
import FieldError from '@/components/FieldError';
import GoogleButton from '@/components/GoogleButton';
import IconInput from '@/components/IconInput';
import OrDivider from '@/components/OrDivider';
import PasswordInput from '@/components/PasswordInput';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import useFrom from '@/hooks/useFrom';
import authError from '@/lib/authError';
import cn from '@/lib/cn';

const schema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email({ error: 'Enter a valid email' })),
    password: z.string().min(1, { error: 'Enter your password' })
});

type Values = z.infer<typeof schema>;

const SignInPage: FC = () => {
    const { signIn } = useAuthActions();
    const navigate = useNavigate();
    const from = useFrom();
    const [ formError, setFormError ] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

    const onSubmit = handleSubmit(async ({ email, password }) => {
        setFormError(null);

        try {
            await signIn('password', { email, password, flow: 'signIn' });
            navigate(from, { replace: true });
        } catch (error) {
            setFormError(authError(error, 'signIn'));
        }
    });

    return (
        <AuthSplitLayout
            hero="diagonal"
            headline={ <>Three in a row.<br />Two players.<br />One game ID.</> }
            lead="Create a game, send the ID to a friend and play in real time from any device."
            footnote="No installs. Moves sync instantly."
        >
            <div
                className={
                    cn([
                        'mt-3 flex flex-col gap-2',
                        'md:mt-0'
                    ])
                }
            >
                <h2
                    className={
                        cn([
                            'font-display text-4xl leading-none font-extrabold tracking-tight',
                            'md:text-3xl md:leading-tight md:font-bold'
                        ])
                    }
                >
                    <span className="md:hidden">Three in a row.<br />Sign in to play.</span>
                    <span
                        className={
                            cn([
                                'hidden',
                                'md:inline'
                            ])
                        }
                    >
                        Sign in
                    </span>
                </h2>
                <p className="text-muted-foreground">Welcome back. Your games are waiting.</p>
            </div>
            <GoogleButton label="Continue with Google" />
            <OrDivider />
            <form
                className="flex flex-col gap-4"
                noValidate
                onSubmit={ onSubmit }
            >
                <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <IconInput
                        id="email"
                        icon={ Mail }
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        aria-invalid={ errors.email ? true : undefined }
                        { ...register('email') }
                    />
                    <FieldError>{ errors.email?.message }</FieldError>
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput
                        id="password"
                        autoComplete="current-password"
                        placeholder="Your password"
                        aria-invalid={ errors.password || formError ? true : undefined }
                        { ...register('password') }
                    />
                    <FieldError>{ errors.password?.message ?? formError }</FieldError>
                </div>
                <Button
                    type="submit"
                    size="lg"
                    disabled={ isSubmitting }
                    className="mt-1"
                >
                    Sign in
                </Button>
            </form>
            <p
                className={
                    cn([
                        'mt-auto text-center text-sm text-muted-foreground',
                        'md:mt-0'
                    ])
                }
            >
                New here?
                { ' ' }
                <Link
                    to="/signup"
                    state={ { from } }
                    className="font-medium text-link hover:text-link-hover"
                >
                    Create an account
                </Link>
            </p>
        </AuthSplitLayout>
    );
};

export default SignInPage;
