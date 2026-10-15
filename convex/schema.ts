import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

import { cellValidator, markValidator, playerValidator, resultValidator } from './validators';

export default defineSchema({
    ...authTables,
    games: defineTable({
        code: v.string(),
        board: v.array(cellValidator),
        turn: markValidator,
        circle: v.union(playerValidator, v.null()),
        cross: v.union(playerValidator, v.null()),
        result: v.union(resultValidator, v.null()),
        // Номер раунду для finishRound; optional, бо ігри, створені до його появи, поля не мають
        round: v.optional(v.number())
    }).index('by_code', [ 'code' ])
});
