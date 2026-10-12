// Заміна TransitionWrapper (react-transition-group не працює з React 19 без nodeRef)
import { AnimatePresence, motion } from 'motion/react';
import type { FC, ReactNode } from 'react';

import { FADE, TAILWIND_EASE } from '@/lib/motion';

type FadeProps = {
    show: boolean,
    className?: string,
    children?: ReactNode
};

const Fade: FC<FadeProps> = ({ show, className, children }) => (
    <AnimatePresence initial={ false }>
        { show && (
            <motion.div
                { ...FADE }
                transition={ { duration: 0.15, ease: TAILWIND_EASE } }
                className={ className }
            >
                { children }
            </motion.div>
        ) }
    </AnimatePresence>
);

export default Fade;
