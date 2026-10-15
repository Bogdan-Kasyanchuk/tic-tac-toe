// Кандидати в блокове тіло: стрілка з неявним поверненням, що кличе функцію.
//
// Типів не знає — відсіює лише очевидне value-returning. Кожен збіг треба
// звірити із сигнатурою: void-виклик правиться, решта лишається.

import { lines, sourceFiles } from './_groups.mjs';

const CALL = /=>\s*([A-Za-z_$][\w$.]*)\(/;

// майже завжди повертають значення — у вивід не потрапляють
const RETURNING = new RegExp(
    String.raw`\.(map|filter|some|every|find|findIndex|flatMap|reduce|sort|localeCompare)\b`
    + String.raw`|^(z|dayjs|cn|twMerge|clsx)\.`
    + String.raw`|^(z|dayjs|cn|twMerge|clsx|mutationOptions|queryOptions|serverGraphApi|cache)$`
);

let found = 0;

for (const file of sourceFiles([ '.tsx', '.ts' ])) {
    for (const [ number, line ] of lines(file)) {
        const match = CALL.exec(line);

        if (!match || RETURNING.test(match[ 1 ]) || RETURNING.test(line)) {
            continue;
        }

        found += 1;
        console.log(`${ file }:${ number }  ${ line.trim().slice(0, 100) }`);
    }
}

console.log(`\n${ found } кандидатів — звірити тип повернення перед правкою`);
