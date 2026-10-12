import cn from '@/lib/cn';
import type { Line } from '@convex/rules';

const LINE: Record<Line, string> = {
    'horizontal': '',
    'vertical': 'rotate-90',
    'rotate_45': 'w-[144%] rotate-45',
    'rotate_-45': 'w-[144%] -rotate-45'
};

// Колишні nth-child-правила з _board.scss: крайні клітинки подовжують лінію за межі поля
const edge = (line: Line, index: number): string[] => {
    switch (line) {
        case 'horizontal':
            if (index % 3 === 0) {
                return [ '-left-5 w-[calc(100%+20px)]' ];
            }

            return index % 3 === 2 ? [ '-right-5 w-[calc(100%+20px)]' ] : [];
        case 'vertical':
            if (index < 3) {
                return [ 'top-7 w-[calc(100%+20px)]', 'md:top-17.5' ];
            }

            return index >= 6 ? [ 'bottom-7 w-[calc(100%+20px)]', 'md:bottom-17.5' ] : [];
        case 'rotate_45':
            if (index === 0) {
                return [ '-left-7 top-8 w-[calc(100%+50px)]', 'md:-left-12.5 md:top-18 md:w-[calc(100%+90px)]' ];
            }

            return index === 8
                ? [ '-right-7 bottom-8 w-[calc(100%+50px)]', 'md:-right-12.5 md:bottom-18.5 md:w-[calc(100%+90px)]' ]
                : [];
        case 'rotate_-45':
            if (index === 2) {
                return [ '-left-5.5 top-8 w-[calc(100%+50px)]', 'md:-left-10 md:top-18 md:w-[calc(100%+90px)]' ];
            }

            return index === 6
                ? [ '-right-5.5 bottom-8 w-[calc(100%+50px)]', 'md:-right-10 md:bottom-18.5 md:w-[calc(100%+90px)]' ]
                : [];
    }
};

export const winLineClassName = (line: Line, index: number): string => cn([
    'absolute z-10 h-2.5 w-[calc(100%+6px)] bg-blue-700',
    LINE[ line ],
    ...edge(line, index)
]);
