import type { FC, ReactNode } from 'react';

import cn from '@/lib/cn';

type ButtonProps = {
    children: ReactNode,
    className?: string,
    type?: 'button' | 'submit',
    onClick?: () => void
};

const Button: FC<ButtonProps> = ({ children, className, type = 'button', onClick }) => (
    <button
        type={ type }
        className={ cn('bg-blue-50 px-4 py-1 text-2xl uppercase transition hover:bg-blue-200', className) }
        onClick={ onClick }
    >
        { children }
    </button>
);

export default Button;
