// Спільне: до якої брейкпоінт-групи належить клас, як групи впорядковані і
// які файли дивитися.

import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';

// У порядку зростання. Проекти команди пишуть xxl/xxxl, Tailwind за
// замовчуванням — 2xl; тримаємо обидві нотації, щоб сканер не мовчав на чужій.
const BREAKPOINTS = [ 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl', '2xl', '3xl', '4xl' ];

// довші альтернативи першими, щоб 'xxl' не збігся раніше за 'xxxl'
const PREFIX = new RegExp(
    `^(max-)?(${ [ ...BREAKPOINTS ].sort((a, b) => b.length - a.length).join('|') }):`
);

// база → max-* → sm → md → lg → xl → xxl
const ORDER = { '': 0 };

BREAKPOINTS.forEach((breakpoint, index) => {
    ORDER[ `max-${ breakpoint }` ] = 0.5;
    ORDER[ breakpoint ] = index + 1;
});

/** Медіа-група класу. Немедійні варіанти (hover:, rtl:, …) — база. */
export const groupOf = cls => {
    const match = PREFIX.exec(cls);

    return match ? match[ 0 ].slice(0, -1) : '';
};

export const rank = cls => ORDER[ groupOf(cls) ];

/** Розбиття рядка класів за пробілами, без порожніх елементів. */
export const words = string => string.split(/\s+/).filter(Boolean);

/**
 * Файли git у вказаних шляхах (типово src).
 *
 * `--others` бере й ще не закомічені: прохід форматування зазвичай
 * дивляться до коміту. Видалені, але не проіндексовані, git усе одно
 * назве, тож їх відсіває перевірка існування. `-z` — щоб кирилиця й пробіли
 * в шляхах не прийшли екранованими в лапках.
 */
export const sourceFiles = suffixes => {
    const paths = process.argv.slice(2);
    const listed = execFileSync(
        'git',
        [ 'ls-files', '-z', '--cached', '--others', '--exclude-standard', ...(paths.length ? paths : [ 'src' ]) ],
        { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
    );

    return listed.split('\0').filter(file => {
        return suffixes.some(suffix => {
            return file.endsWith(suffix);
        }) && statSync(file, { throwIfNoEntry: false })?.isFile();
    });
};

/**
 * Рядки файлу з номерами від 1.
 *
 * Під `core.autocrlf=true` на Windows файли лежать із CRLF, а якорі `$` у
 * сканерах на `\r` не спрацьовують — тож обидва закінчення зводяться тут.
 */
export const lines = file => {
    return readFileSync(file, 'utf8')
        .replace(/^\uFEFF/, '')
        .split(/\r?\n/)
        .map((line, index) => {
            return [ index + 1, line ];
        });
};
