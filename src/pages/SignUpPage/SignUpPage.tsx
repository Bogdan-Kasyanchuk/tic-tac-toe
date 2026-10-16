import { useAuthActions } from '@convex-dev/auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, UserRound } from 'lucide-react';
import { type FC, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import passwordStrength from '@/lib/passwordStrength';
import { MIN_PASSWORD_LENGTH } from '@convex/authRules';

const schema = z.object({
    name: z.string().trim().min(1, { error: 'Enter your name' }).max(40, { error: 'Keep it under 40 characters' }),
    email: z.string().trim().toLowerCase().pipe(z.email({ error: 'Enter a valid email' })),
    password: z.string().min(MIN_PASSWORD_LENGTH, { error: `Password must be at least ${ MIN_PASSWORD_LENGTH } characters` })
});

type Values = z.infer<typeof schema>;

// Оцінка над підказкою, як на канвасі («Good. At least 8 characters…»)
const STRENGTH_LABEL = [ '', 'Weak. ', 'Good. ', 'Strong. ' ];

const SignUpPage: FC = () => {
    const { signIn } = useAuthActions();
    const navigate = useNavigate();
    const from = useFrom();
    const [ formError, setFormError ] = useState<string | null>(null);
    const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });
    // useWatch, а не watch(): watch React Compiler не вміє безпечно мемоізувати
    const strength = passwordStrength(useWatch({ control, name: 'password' }) ?? '');

    const onSubmit = handleSubmit(async ({ name, email, password }) => {
        setFormError(null);

        try {
            await signIn('password', { name, email, password, flow: 'signUp' });
            navigate(from, { replace: true });
        } catch (error) {
            setFormError(authError(error, 'signUp'));
        }
    });

    return (
        <AuthSplitLayout
            hero="column"
            headline={ <>Your name on<br />every scoreboard.</> }
            lead="One account for every device. Sign in with Google or with your email."
            footnote="Your email is only used to sign in."
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
                            'font-display text-3xl leading-tight font-extrabold tracking-tight',
                            'md:font-bold'
                        ])
                    }
                >
                    Create an account
                </h2>
                <p className="text-muted-foreground">It takes less than a minute.</p>
            </div>
            <GoogleButton label="Sign up with Google" />
            <OrDivider />
            <form
                className="flex flex-col gap-4"
                noValidate
                onSubmit={ onSubmit }
            >
                <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Name</Label>
                    <IconInput
                        id="name"
                        icon={ UserRound }
                        autoComplete="nickname"
                        placeholder="Shown to your opponent"
                        aria-invalid={ errors.name ? true : undefined }
                        { ...register('name') }
                    />
                    <FieldError>{ errors.name?.message }</FieldError>
                </div>
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
                        autoComplete="new-password"
                        aria-describedby="password-hint"
                        aria-invalid={ errors.password ? true : undefined }
                        { ...register('password') }
                    />
                    <div
                        aria-hidden="true"
                        className="grid grid-cols-3 gap-1.5"
                    >
                        { [ 0, 1, 2 ].map(level => (
                            <span
                                key={ level }
                                className={ cn('h-1 rounded-full', level < strength ? 'bg-circle' : 'bg-border') }
                            />
                        )) }
                    </div>
                    { errors.password
                        ? <FieldError>{ errors.password.message }</FieldError>
                        : (
                            <p
                                id="password-hint"
                                className="text-sm text-muted-foreground"
                            >
                                { STRENGTH_LABEL[ strength ] }
                                At least
                                { ' ' }
                                { MIN_PASSWORD_LENGTH }
                                { ' ' }
                                characters
                                <span
                                    className={
                                        cn([
                                            'hidden',
                                            'md:inline'
                                        ])
                                    }
                                >
                                    ; a mix of letters and digits is stronger
                                </span>
                                .
                            </p>
                        ) }
                </div>
                <FieldError>{ formError }</FieldError>
                <Button
                    type="submit"
                    size="lg"
                    disabled={ isSubmitting }
                >
                    Create account
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
                Already have an account?
                { ' ' }
                <Link
                    to="/login"
                    state={ { from } }
                    className="font-medium text-link hover:text-link-hover"
                >
                    Sign in
                </Link>
            </p>
        </AuthSplitLayout>
    );
};

export default SignUpPage;
