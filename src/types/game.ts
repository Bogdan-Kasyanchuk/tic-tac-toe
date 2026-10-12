import type { FunctionReturnType } from 'convex/server';

import type { api } from '@convex/_generated/api';

export type GameView = NonNullable<FunctionReturnType<typeof api.games.get>>;
export type PlayerView = NonNullable<GameView[ 'circle' ]>;
