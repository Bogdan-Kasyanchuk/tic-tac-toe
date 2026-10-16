import type { FC } from 'react';

import cn from '@/lib/cn';

const Logo: FC<{ className?: string }> = ({ className }) => (
    <span className={ cn('flex items-center gap-2.5', className) }>
        <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            aria-hidden="true"
        >
            <rect
                width="32"
                height="32"
                rx="9"
                className="fill-secondary"
            />
            <circle
                cx="10.5"
                cy="16"
                r="4.5"
                fill="none"
                strokeWidth="2.5"
                className="stroke-circle"
            />
            <path
                d="M18 11.5l9 9M27 11.5l-9 9"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="stroke-cross"
            />
        </svg>
        <span className="font-display text-xl font-bold tracking-tight text-foreground">tic·tac·toe</span>
    </span>
);

export default Logo;
