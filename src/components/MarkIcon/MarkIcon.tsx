import type { FC } from 'react';

import cn from '@/lib/cn';
import type { Mark } from '@convex/rules';

const MarkIcon: FC<{ mark: Mark }> = ({ mark }) => {
    if (mark === 'circle') {
        return (
            <div
                className={
                    cn([
                        'h-8 w-8 rounded-full border-4 border-green',
                        'md:h-11 md:w-11'
                    ])
                }
            />
        );
    }

    return (
        <div
            className={
                cn([
                    'relative flex h-8 w-8 items-center justify-center',
                    'md:h-11 md:w-11'
                ])
            }
        >
            <div
                className={
                    cn([
                        'absolute h-1 w-10 rotate-45 bg-red',
                        'md:w-14'
                    ])
                }
            />
            <div
                className={
                    cn([
                        'absolute h-1 w-10 -rotate-45 bg-red',
                        'md:w-14'
                    ])
                }
            />
        </div>
    );
};

export default MarkIcon;
