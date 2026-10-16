import { firstName } from '@/lib/initials';
import type { GameView } from '@/types/game';
import { otherMark } from '@convex/rules';

const NEXT_ROUND = 'Next round starts in a moment';

export type GameStatus = {
    text: string,
    hint: string | null,
    tone: 'circle' | 'cross' | 'muted',
    waiting: boolean
};

export const canMove = (game: GameView): boolean => Boolean(game.circle && game.cross) && !game.result && game.turn === game.me;

export const gameStatus = (game: GameView): GameStatus => {
    const opponent = firstName(game[ otherMark(game.me) ]?.name ?? '');

    if (!game.circle || !game.cross) {
        return { text: 'Waiting for a second player', hint: null, tone: 'muted', waiting: false };
    }

    if (game.result?.kind === 'win') {
        return {
            text: game.result.mark === game.me ? 'You take the round' : `${ opponent } takes the round`,
            hint: NEXT_ROUND,
            tone: game.result.mark,
            waiting: false
        };
    }

    if (game.result?.kind === 'draw') {
        return { text: 'Draw. Nobody takes this one', hint: NEXT_ROUND, tone: 'muted', waiting: false };
    }

    if (game.turn === game.me) {
        return { text: 'Your turn', hint: 'Tap an empty cell', tone: game.me, waiting: false };
    }

    return {
        text: `${ opponent }'s turn`,
        hint: 'Waiting for their move. The board unlocks on your turn.',
        tone: game.turn,
        waiting: true
    };
};
