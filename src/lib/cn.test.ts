import { expect, test } from 'vitest';

import cn from './cn';

// Кеглі й інтервали з @theme у src/index.css: tailwind-merge має бачити в них розмір, а не колір
test('a theme font size replaces the base size and keeps the colour', () => {
    expect(cn('text-lg font-semibold text-foreground', 'text-dialog-title')).toBe('font-semibold text-foreground text-dialog-title');
});

test('every theme font size counts as a font size', () => {
    for (const size of [ 'page-title', 'score', 'score-sm', 'dialog-title', 'logo', 'hero', 'hero-sm', 'form-title' ]) {
        expect(cn('text-sm', `text-${ size }`)).toBe(`text-${ size }`);
    }
});

test('theme line heights count as line heights', () => {
    expect(cn('leading-tight', 'leading-body')).toBe('leading-body');
    expect(cn('leading-body', 'leading-heading')).toBe('leading-heading');
});
