import { expect, test } from 'vitest';

import cn from './cn';

// Кеглі й інтервали з @theme у src/index.css: tailwind-merge має бачити в них розмір, а не колір
test('a theme font size replaces the base size and keeps the colour', () => {
    expect(cn('text-lg font-semibold text-foreground', 'text-dialog-title')).toBe('font-semibold text-foreground text-dialog-title');
});

test('every theme font size counts as a font size', () => {
    for (const size of [ 'page-title', 'score', 'score-sm', 'dialog-title', 'logo', 'hero' ]) {
        expect(cn('text-sm', `text-${ size }`)).toBe(`text-${ size }`);
    }
});

test('theme line heights count as line heights', () => {
    expect(cn('leading-tight', 'leading-body')).toBe('leading-body');
    expect(cn('leading-body', 'leading-heading')).toBe('leading-heading');
});

test('theme letter spacings count as letter spacings', () => {
    for (const tracking of [ 'title', 'heading', 'label' ]) {
        expect(cn('tracking-tight', `tracking-${ tracking }`)).toBe(`tracking-${ tracking }`);
    }
});

test('theme shadows replace the base shadow', () => {
    for (const shadow of [ 'menu', 'dialog', 'drawer' ]) {
        expect(cn('shadow-lg', `shadow-${ shadow }`)).toBe(`shadow-${ shadow }`);
    }
});
