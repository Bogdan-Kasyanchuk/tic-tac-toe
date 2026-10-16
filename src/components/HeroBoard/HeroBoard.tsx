import type { FC } from 'react';

const GRID = 'M107 16v288M213 16v288M16 107h288M16 213h288';

// Поле з лівої панелі сторінок входу: Main — нолики на діагоналі, SignUp — хрестики в середній колонці
const BOARDS = {
    diagonal: {
        circles: [ [ 53, 53 ], [ 160, 160 ], [ 267, 267 ] ],
        crosses: 'M136 29l48 48M184 29l-48 48M243 136l48 48M291 136l-48 48M29 243l48 48M77 243l-48 48',
        line: 'M28 28L292 292'
    },
    column: {
        circles: [ [ 53, 53 ], [ 267, 160 ] ],
        crosses: 'M136 29l48 48M184 29l-48 48M136 136l48 48M184 136l-48 48M136 243l48 48M184 243l-48 48',
        line: 'M160 22L160 298'
    }
};

const HeroBoard: FC<{ variant: keyof typeof BOARDS }> = ({ variant }) => {
    const { circles, crosses, line } = BOARDS[ variant ];

    return (
        <svg
            width="280"
            height="280"
            viewBox="0 0 320 320"
            aria-hidden="true"
            className="h-auto max-w-full"
        >
            <path
                d={ GRID }
                strokeWidth="6"
                strokeLinecap="round"
                className="stroke-border"
            />
            { circles.map(([ cx, cy ]) => (
                <circle
                    key={ `${ cx }-${ cy }` }
                    cx={ cx }
                    cy={ cy }
                    r="28"
                    fill="none"
                    strokeWidth="11"
                    className="stroke-circle"
                />
            )) }
            <path
                d={ crosses }
                strokeWidth="11"
                strokeLinecap="round"
                className="stroke-cross"
            />
            <path
                d={ line }
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.9"
                className="stroke-foreground"
            />
        </svg>
    );
};

export default HeroBoard;
