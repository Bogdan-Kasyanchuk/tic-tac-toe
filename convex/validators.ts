import { v } from 'convex/values';

export const markValidator = v.union(v.literal('circle'), v.literal('cross'));

export const cellValidator = v.union(v.literal(''), markValidator);

export const lineValidator = v.union(
    v.literal('horizontal'),
    v.literal('vertical'),
    v.literal('rotate_45'),
    v.literal('rotate_-45')
);

export const playerValidator = v.object({
    userId: v.id('users'),
    score: v.number()
});

export const resultValidator = v.union(
    v.object({
        kind: v.literal('win'),
        mark: markValidator,
        line: lineValidator,
        cells: v.array(v.number())
    }),
    v.object({ kind: v.literal('draw') })
);
