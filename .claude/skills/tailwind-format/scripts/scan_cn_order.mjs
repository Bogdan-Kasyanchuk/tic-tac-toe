// Два порушення всередині cn(): змішані групи в одному рядку і збитий порядок.
//
// Умовні ключі об'єкта ('md:… lg:…': cond) пропускаються — вони не розбиваються.

import { groupOf, lines, rank, sourceFiles, words } from './_groups.mjs';

const mixed = [];
const disordered = [];

for (const file of sourceFiles([ '.tsx', '.ts' ])) {
    let previous = null;

    for (const [ number, line ] of lines(file)) {
        const stripped = line.trim();

        if (stripped.startsWith('cn(')) {
            previous = null;
        }

        // лише самостійний рядок-аргумент, не ключ об'єкта ('…': cond)
        const match = /^'([^']+)',?$/.exec(stripped);
        const classes = match ? words(match[ 1 ]) : [];

        if (!classes.length) {
            continue;
        }

        if (new Set(classes.map(groupOf)).size > 1) {
            mixed.push(`${ file }:${ number }  ${ match[ 1 ].slice(0, 90) }`);
        }

        const current = rank(classes[ 0 ]);

        if (previous !== null && current < previous) {
            disordered.push(`${ file }:${ number }  ${ stripped.slice(0, 90) }`);
        }

        previous = current;
    }
}

console.log(`${ mixed.length } рядків змішують групи`);

mixed.forEach(row => {
    console.log('   ' + row);
});

console.log(`\n${ disordered.length } рядків порушують порядок груп`);

disordered.forEach(row => {
    console.log('   ' + row);
});
