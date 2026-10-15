// Плоскі className="…", що охоплюють кілька брейкпоінт-груп.
//
// Такі треба розкласти в cn([…]) по рядку на групу. Порушення однозначне.

import { groupOf, lines, rank, sourceFiles, words } from './_groups.mjs';

let found = 0;

for (const file of sourceFiles([ '.tsx', '.ts' ])) {
    for (const [ number, line ] of lines(file)) {
        for (const match of line.matchAll(/className="([^"]*)"/g)) {
            const classes = words(match[ 1 ]);
            const groups = [ ...new Set(classes.map(groupOf)) ];

            if (groups.length < 2) {
                continue;
            }

            found += 1;
            console.log(`${ file }:${ number }`);

            groups
                .sort((a, b) => {
                    return rank(a ? `${ a }:` : '') - rank(b ? `${ b }:` : '');
                })
                .forEach(group => {
                    console.log(`    ${ classes.filter(cls => groupOf(cls) === group).join(' ') }`);
                });
        }
    }
}

console.log(`\n${ found } плоских className із кількома групами`);
