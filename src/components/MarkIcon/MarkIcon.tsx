import type { FC } from 'react';

import cn from '@/lib/cn';
import type { Mark } from '@convex/rules';

const MarkIcon: FC<{ mark: Mark, className?: string }> = ({ mark, className }) => (
    <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className={ cn('size-10', className) }
    >
        { mark === 'circle'
            ? (
                <circle
                    cx="50"
                    cy="50"
                    r="34"
                    fill="none"
                    strokeWidth="12"
                    className="stroke-circle"
                />
            )
            : (
                <path
                    d="M18 18 82 82M82 18 18 82"
                    strokeWidth="12"
                    strokeLinecap="round"
                    className="stroke-cross"
                />
            ) }
    </svg>
);

export default MarkIcon;
