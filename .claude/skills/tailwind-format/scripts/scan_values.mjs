// Значення, які мали б прийти з теми, а прийшли літералом.
//
// Ціна в усіх родин одна: літерал не ходить за темою, і правка `--spacing`,
// токена чи брейкпоінта його мовчки обминає. Лінтера немає — `tsc` бачить
// рядок, stylelint не знає про Tailwind.
//
// Сканер дає кандидата, а не вирок: крок шкали він порахує, але іменований
// токен (`max-w-3xl`) буває кращою відповіддю за той самий розмір кроком.

import { lines, sourceFiles, words } from './_groups.mjs';

// Крок шкали `--spacing` у px. Типовий для Tailwind 4; тема може змінити.
const STEP_PX = 4;

// Утиліти, чиє числове значення — крок шкали (`px-3.75` = 15px).
const SPACING = new Set([
    'p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'ps', 'pe',
    'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml', 'ms', 'me',
    'w', 'h', 'size', 'min-w', 'min-h', 'max-w', 'max-h',
    'gap', 'gap-x', 'gap-y', 'space-x', 'space-y',
    'inset', 'inset-x', 'inset-y', 'inset-s', 'inset-e',
    'top', 'right', 'bottom', 'left', 'start', 'end',
    'translate', 'translate-x', 'translate-y',
    'leading', 'basis', 'indent'
]);

// Утиліти, чиє числове значення — самі px (`border-2` = 2px).
const RAW_PX = /^(border|outline|ring|ring-offset|divide)(-[xytrbles])?$/;

const RENAMED = {
    'break-words': 'wrap-break-word',
    'overflow-ellipsis': 'text-ellipsis',
    'flex-shrink-0': 'shrink-0',
    'flex-grow': 'grow'
};

// Порядок друку — порядок оголошення.
const FINDINGS = {
    scale: [ 'довільний px там, де є крок шкали', [] ],
    theme: [ 'довільне значення поза шкалою — звірити з темою', [] ],
    variable: [ '[var(--x)] замість форми (--x)', [] ],
    important: [ '!utility замість суфікса utility!', [] ],
    logical: [ 'start-*/end-* замість inset-s-*/inset-e-*', [] ],
    renamed: [ 'ім\'я з Tailwind 3', [] ],
    inlineVar: [ 'оголошення змінної на місці — чи є утиліта', [] ]
};

const INLINE_VAR = /\[(--[a-z0-9-]+):([^\]]+)\]/;
const VARIABLE = /\[var\((--[a-z0-9-]+)\)\]/;
const ARBITRARY = /^(-?)([a-z][a-z-]*)-\[(-?\d+(?:\.\d+)?)px\]$/;
const Z_LITERAL = /^-?z-\[\d+\]$/;
const IMPORTANT = /^!-?[a-z[]/;
const LOGICAL = /^(-?)(start|end)-(.+)$/;

const APPLY = /@apply\s+([^;]+);/g;
const ATTRIBUTE = /class(?:Name)?\s*=\s*"([^"]*)"/g;
const QUOTED = /'([^']*)'/g;
const ARGUMENT = /^'([^']*)'\s*[,:]?$/;
const CN_CALL = /\bcn\(/;

/** Число без хвостових нулів: 3.75 → `3.75`, 5.0 → `5`. */
const number = value => {
    return value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
};

const report = (kind, file, lineNumber, token, hint) => {
    const row = `${ file }:${ lineNumber }  ${ token }`;

    FINDINGS[ kind ][ 1 ].push(hint ? `${ row }  →  ${ hint }` : row);
};

/**
 * Варіанти й сама утиліта: `md:hover:px-[18px]` → `md:hover:`, `px-[18px]`.
 *
 * Двокрапки всередині довільного значення (`bg-[url(data:…)]`) за
 * роздільник не рахуються.
 */
const split = token => {
    const bracket = token.indexOf('[');
    const head = bracket === -1 ? token : token.slice(0, bracket);
    const last = head.lastIndexOf(':');

    return last === -1 ? [ '', token ] : [ token.slice(0, last + 1), token.slice(last + 1) ];
};

const checkToken = (token, file, lineNumber) => {
    // Рядок CSS, а не список класів: інлайновий стиль, шматок розмітки.
    if (token.includes(';') || token.includes('{')) {
        return;
    }

    const [ variants, bare ] = split(token);

    const inlineVar = INLINE_VAR.exec(token);

    if (inlineVar) {
        report('inlineVar', file, lineNumber, token, `змінна ${ inlineVar[ 1 ] }`);
    }

    const variable = VARIABLE.exec(token);

    if (variable) {
        report('variable', file, lineNumber, token, token.replace(variable[ 0 ], `(${ variable[ 1 ] })`));
    }

    // Тільки рівно `[Npx]`: `[min(400px,…)]` і `[0_0_16px_rgba(…)]` лишаються.
    const arbitrary = ARBITRARY.exec(bare);

    if (arbitrary) {
        const [ , sign, utility, value ] = arbitrary;
        const px = Number(value) * (sign === '-' ? -1 : 1);
        const edge = px < 0 ? '-' : '';

        // Tailwind 4 приймає крок шкали лише кратним 0.25, а ширину рамки —
        // лише цілою: `w-48.625` чи `border-1.5` класу не утворюють, тож такий
        // літерал іде в «поза шкалою», а не в готову заміну.
        const step = Math.abs(px) / STEP_PX;

        if (SPACING.has(utility) && Number.isInteger(step * 4)) {
            report('scale', file, lineNumber, token, `${ variants }${ edge }${ utility }-${ number(step) }`);
        } else if (SPACING.has(utility)) {
            report('theme', file, lineNumber, token, `крок ${ number(step) } не кратний 0.25`);
        } else if (RAW_PX.test(utility) && Number.isInteger(px)) {
            report('scale', file, lineNumber, token, `${ variants }${ edge }${ utility }-${ number(Math.abs(px)) }`);
        } else if (RAW_PX.test(utility)) {
            report('theme', file, lineNumber, token, 'ширина не ціла');
        } else {
            report('theme', file, lineNumber, token);
        }
    }

    // Шар — це завжди іменований токен теми: голе число розводить шари по
    // файлах, і сусідство двох шарів стає видно лише в браузері.
    if (Z_LITERAL.test(bare)) {
        report('theme', file, lineNumber, token, 'токен z-* із теми');
    }

    if (IMPORTANT.test(bare)) {
        report('important', file, lineNumber, token, `${ variants }${ bare.slice(1) }!`);
    }

    const logical = LOGICAL.exec(bare);

    if (logical) {
        const [ , sign, side, rest ] = logical;
        const edge = side === 'start' ? 'inset-s' : 'inset-e';

        report('logical', file, lineNumber, token, `${ variants }${ sign }${ edge }-${ rest }`);
    }

    const renamed = RENAMED[ bare.replace(/^[-!]+/, '') ];

    if (renamed) {
        report('renamed', file, lineNumber, token, `${ variants }${ renamed }`);
    }
};

/** Рядки класів беруться саме звідти, де проект їх тримає. */
const classStrings = (line, isCss) => {
    if (isCss) {
        return [ ...line.matchAll(APPLY) ].map(match => match[ 1 ]);
    }

    const found = [ ...line.matchAll(ATTRIBUTE) ].map(match => match[ 1 ]);

    if (line.includes('className') || CN_CALL.test(line)) {
        found.push(...[ ...line.matchAll(QUOTED) ].map(match => match[ 1 ]));
    } else {
        const argument = ARGUMENT.exec(line.trim());

        if (argument) {
            found.push(argument[ 1 ]);
        }
    }

    return found;
};

for (const file of sourceFiles([ '.tsx', '.ts', '.css' ])) {
    const isCss = file.endsWith('.css');

    for (const [ lineNumber, line ] of lines(file)) {
        for (const string of classStrings(line, isCss)) {
            for (const token of words(string)) {
                checkToken(token, file, lineNumber);
            }
        }
    }
}

let total = 0;

for (const [ title, rows ] of Object.values(FINDINGS)) {
    console.log(`\n${ rows.length } — ${ title }`);

    rows.forEach(row => {
        console.log('   ' + row);
    });

    total += rows.length;
}

console.log(`\nразом ${ total }`);
