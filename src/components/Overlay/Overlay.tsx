import type { FC, MouseEvent, ReactNode } from 'react';

import cn from '@/lib/cn';

type OverlayProps = {
    children?: ReactNode,
    className?: string,
    onClick?: (event: MouseEvent<HTMLDivElement>) => void
};

const Overlay: FC<OverlayProps> = ({ children, className, onClick }) => (
    <div
        className={ cn('fixed inset-0 z-20 flex items-center justify-center bg-black/70', className) }
        onClick={ onClick }
    >
        { children }
    </div>
);

export default Overlay;
