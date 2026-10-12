import { describe, expect, test } from 'vitest';

import { winLineClassName } from './winLine';

const classes = (line: Parameters<typeof winLineClassName>[ 0 ], index: number) =>
    winLineClassName(line, index).split(' ');

describe('winLineClassName', () => {
    test('middle cells keep the base width', () => {
        expect(classes('horizontal', 1)).toContain('w-[calc(100%+6px)]');
        expect(classes('vertical', 4)).toEqual(expect.arrayContaining([ 'rotate-90', 'w-[calc(100%+6px)]' ]));
        expect(classes('rotate_45', 4)).toEqual(expect.arrayContaining([ 'rotate-45', 'w-[144%]' ]));
        expect(classes('rotate_-45', 4)).toEqual(expect.arrayContaining([ '-rotate-45', 'w-[144%]' ]));
    });

    test('horizontal edges stick out by 20px', () => {
        expect(classes('horizontal', 3)).toEqual(expect.arrayContaining([ '-left-5', 'w-[calc(100%+20px)]' ]));
        expect(classes('horizontal', 5)).toEqual(expect.arrayContaining([ '-right-5', 'w-[calc(100%+20px)]' ]));
        expect(classes('horizontal', 3)).not.toContain('w-[calc(100%+6px)]');
    });

    test('vertical edges move with the breakpoint', () => {
        expect(classes('vertical', 1)).toEqual(expect.arrayContaining([ 'top-7', 'md:top-17.5', 'w-[calc(100%+20px)]' ]));
        expect(classes('vertical', 7)).toEqual(expect.arrayContaining([ 'bottom-7', 'md:bottom-17.5' ]));
    });

    test('diagonal corners override the 144% width', () => {
        expect(classes('rotate_45', 0)).toEqual(expect.arrayContaining([
            '-left-7',
            'top-8',
            'w-[calc(100%+50px)]',
            'md:-left-12.5',
            'md:top-18',
            'md:w-[calc(100%+90px)]'
        ]));
        expect(classes('rotate_45', 0)).not.toContain('w-[144%]');
        expect(classes('rotate_45', 8)).toEqual(expect.arrayContaining([ '-right-7', 'bottom-8', 'md:bottom-18.5' ]));
        expect(classes('rotate_-45', 2)).toEqual(expect.arrayContaining([ '-left-5.5', 'top-8', 'md:-left-10' ]));
        expect(classes('rotate_-45', 6)).toEqual(expect.arrayContaining([ '-right-5.5', 'bottom-8', 'md:-right-10' ]));
    });
});
