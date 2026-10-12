import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError, v } from 'convex/values';

import { internal } from './_generated/api';
import type { Doc, Id } from './_generated/dataModel';
import { type MutationCtx, type QueryCtx, internalMutation, mutation, query } from './_generated/server';
import {
    BOARD_SIZE,
    type Mark,
    ROUND_END_DELAY_MS,
    emptyBoard,
    findWinLine,
    isBoardFull,
    otherMark
} from './rules';
import { markValidator } from './validators';

const CODE_PATTERN = /^[\w-]{1,64}$/;

const requireUserId = async (ctx: QueryCtx | MutationCtx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
        throw new ConvexError('Not authenticated');
    }

    return userId;
};

const findGame = (ctx: QueryCtx, code: string) => ctx.db
    .query('games')
    .withIndex('by_code', q => q.eq('code', code.trim()))
    .unique();

const markOf = (game: Doc<'games'>, userId: Id<'users'>): Mark | null => {
    if (game.circle?.userId === userId) {
        return 'circle';
    }

    if (game.cross?.userId === userId) {
        return 'cross';
    }

    return null;
};

const requireGame = async (ctx: QueryCtx, code: string) => {
    const game = await findGame(ctx, code);

    if (!game) {
        throw new ConvexError('Not game');
    }

    return game;
};

const requireMark = (game: Doc<'games'>, userId: Id<'users'>): Mark => {
    const mark = markOf(game, userId);

    if (!mark) {
        throw new ConvexError('Not a player');
    }

    return mark;
};

const freshRound = () => ({
    board: emptyBoard(),
    turn: 'circle' as const,
    result: null
});

export const enter = mutation({
    args: {
        code: v.string(),
        mark: v.optional(markValidator)
    },
    handler: async (ctx, args) => {
        const userId = await requireUserId(ctx);
        const code = args.code.trim();

        if (!CODE_PATTERN.test(code)) {
            throw new ConvexError('Invalid game ID');
        }

        const game = await findGame(ctx, code);
        const player = { userId, score: 0 };

        if (!game) {
            if (!args.mark) {
                throw new ConvexError('Not game');
            }

            await ctx.db.insert('games', {
                code,
                ...freshRound(),
                circle: args.mark === 'circle' ? player : null,
                cross: args.mark === 'cross' ? player : null
            });

            return 'created' as const;
        }

        if (markOf(game, userId)) {
            return 'already' as const;
        }

        if (game.circle === null) {
            await ctx.db.patch('games', game._id, { circle: player });

            return 'joined' as const;
        }

        if (game.cross === null) {
            await ctx.db.patch('games', game._id, { cross: player });

            return 'joined' as const;
        }

        throw new ConvexError('Maximum number of players');
    }
});

export const get = query({
    args: { code: v.string() },
    handler: async (ctx, { code }) => {
        const userId = await getAuthUserId(ctx);

        if (userId === null) {
            return null;
        }

        const game = await findGame(ctx, code);
        const me = game ? markOf(game, userId) : null;

        if (!game || !me) {
            return null;
        }

        const loadPlayer = async (player: Doc<'games'>[ 'circle' ]) => {
            if (!player) {
                return null;
            }

            const user = await ctx.db.get('users', player.userId);

            return {
                name: user?.name ?? '',
                avatar: user?.image ?? '',
                score: player.score
            };
        };

        return {
            code: game.code,
            board: game.board,
            turn: game.turn,
            result: game.result,
            me,
            circle: await loadPlayer(game.circle),
            cross: await loadPlayer(game.cross)
        };
    }
});

export const makeMove = mutation({
    args: {
        code: v.string(),
        cell: v.number()
    },
    handler: async (ctx, { code, cell }) => {
        const userId = await requireUserId(ctx);
        const game = await requireGame(ctx, code);
        const mark = requireMark(game, userId);

        if (!game.circle || !game.cross) {
            throw new ConvexError('Waiting for the second player');
        }

        if (game.result) {
            throw new ConvexError('Round is over');
        }

        if (game.turn !== mark) {
            throw new ConvexError('Not your turn');
        }

        if (!Number.isInteger(cell) || cell < 0 || cell >= BOARD_SIZE || game.board[ cell ] !== '') {
            throw new ConvexError('Invalid move');
        }

        const board = game.board.map((value, index) => (index === cell ? mark : value));
        const winLine = findWinLine(board);

        if (winLine) {
            await ctx.db.patch('games', game._id, {
                board,
                result: { kind: 'win', mark, ...winLine },
                ...(mark === 'circle'
                    ? { circle: { ...game.circle, score: game.circle.score + 1 } }
                    : { cross: { ...game.cross, score: game.cross.score + 1 } })
            });
            await ctx.scheduler.runAfter(ROUND_END_DELAY_MS, internal.games.finishRound, { gameId: game._id });

            return null;
        }

        if (isBoardFull(board)) {
            await ctx.db.patch('games', game._id, { board, result: { kind: 'draw' } });
            await ctx.scheduler.runAfter(ROUND_END_DELAY_MS, internal.games.finishRound, { gameId: game._id });

            return null;
        }

        await ctx.db.patch('games', game._id, { board, turn: otherMark(mark) });

        return null;
    }
});

export const finishRound = internalMutation({
    args: { gameId: v.id('games') },
    handler: async (ctx, { gameId }) => {
        const game = await ctx.db.get('games', gameId);

        // Раунд уже скинули вручну (Clear/New) або гру видалили
        if (!game || !game.result) {
            return;
        }

        await ctx.db.patch('games', gameId, freshRound());
    }
});
