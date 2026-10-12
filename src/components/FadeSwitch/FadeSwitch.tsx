// Заміна SwitchTransitionWrapper: старий вміст згасає, новий з'являється (out-in), 75 мс
import { AnimatePresence, motion } from 'motion/react';
import type { FC, ReactNode } from 'react';

import { FADE, TAILWIND_EASE } from '@/lib/motion';

type FadeSwitchProps = {
    switchKey: string,
    children?: ReactNode
};

const FadeSwitch: FC<FadeSwitchProps> = ({ switchKey, children }) => (
    <AnimatePresence
        initial={ false }
        mode="wait"
    >
        <motion.div
            key={ switchKey }
            { ...FADE }
            transition={ { duration: 0.075, ease: TAILWIND_EASE } }
        >
            { children }
        </motion.div>
    </AnimatePresence>
);

export default FadeSwitch;
