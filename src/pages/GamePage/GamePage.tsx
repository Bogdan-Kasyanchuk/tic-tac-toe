import { useMutation, useQuery } from 'convex/react';
import { Plus, RotateCcw } from 'lucide-react';
import { type FC, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { toast } from 'sonner';

import Board from '@/components/Board';
import PlayerCard from '@/components/PlayerCard';
import Spinner from '@/components/Spinner';
import TurnStatus from '@/components/TurnStatus';
import { Button } from '@/components/ui/button';
import WaitingForOpponent from '@/components/WaitingForOpponent';
import cn from '@/lib/cn';
import errorMessage from '@/lib/errorMessage';
import { gameStatus } from '@/lib/gameStatus';
import { api } from '@convex/_generated/api';
import type { Mark } from '@convex/rules';

// Один id на всі toast-и входу: у dev StrictMode викликає enter двічі, і toast оновлюється, а не дублюється
const ENTER_TOAST = 'game-enter';

const onError = (error: unknown) => {
    toast.error(errorMessage(error));
};

const GamePage: FC = () => {
    const { gameId = '' } = useParams();
    const [ searchParams ] = useSearchParams();
    const navigate = useNavigate();
    const game = useQuery(api.games.get, { code: gameId });
    const enter = useMutation(api.games.enter);
    const makeMove = useMutation(api.games.makeMove);
    const clearBoard = useMutation(api.games.clearBoard);
    const newSession = useMutation(api.games.newSession);
    const isMoving = useRef(false);

    const markParam = searchParams.get('mark');
    const mark = markParam === 'circle' || markParam === 'cross' ? markParam : undefined;

    // Вхід ідемпотентний: повторний виклик (StrictMode, друга вкладка, повернення за посиланням) дає 'already'
    useEffect(
        () => {
            enter({ code: gameId, mark })
                .then(status => {
                    if (status === 'created') {
                        toast.success('New game', { id: ENTER_TOAST });
                        navigate(`/game/${ encodeURIComponent(gameId) }`, { replace: true });
                    }

                    if (status === 'joined') {
                        toast.success('Join game', { id: ENTER_TOAST });
                    }
                })
                .catch((error: unknown) => {
                    toast.error(errorMessage(error), { id: ENTER_TOAST });
                    navigate('/');
                });
        },
        [ enter, gameId, mark, navigate ]
    );

    // undefined — запит ще вантажиться; null після того, як гра вже була, — місце звільнили (інша вкладка) або гру видалили
    const wasInGame = useRef(false);

    useEffect(
        () => {
            if (game) {
                wasInGame.current = true;

                return;
            }

            if (game === null && wasInGame.current) {
                wasInGame.current = false;
                toast.error('Not game', { id: ENTER_TOAST });
                navigate('/');
            }
        },
        [ game, navigate ]
    );

    // Review Focus 5: подвійний клік не шле другий хід, поки перший не повернувся
    const onSelect = (cell: number) => {
        if (!game || !game.circle || !game.cross || game.result || game.turn !== game.me || isMoving.current) {
            return;
        }

        isMoving.current = true;
        makeMove({ code: gameId, cell })
            .catch(onError)
            .finally(() => {
                isMoving.current = false;
            });
    };

    if (!game) {
        return <Spinner />;
    }

    const status = gameStatus(game);
    const ready = Boolean(game.circle && game.cross);
    const activityOf = (mark: Mark) => {
        if (!ready || game.result || game.turn !== mark) {
            return null;
        }

        return mark === game.me ? '· your move' : '· thinking…';
    };

    return (
        <>
            { (!game.circle || !game.cross) && <WaitingForOpponent code={ game.code } /> }
            <div
                className={
                    cn([
                        'grid w-full grow grid-rows-[auto_auto_1fr] gap-5',
                        'md:grid-cols-[minmax(0,32.5rem)_minmax(0,23.75rem)] md:grid-rows-[auto_1fr] md:justify-center md:gap-x-10 md:gap-y-3'
                    ])
                }
            >
                <section
                    aria-label="Players"
                    className={
                        cn([
                            'grid grid-cols-2 gap-2.5',
                            'md:col-start-2 md:row-start-1 md:grid-cols-1 md:content-start md:gap-3'
                        ])
                    }
                >
                    <h2
                        className={
                            cn([
                                'text-xs font-medium tracking-widest text-muted-foreground uppercase',
                                'max-md:hidden'
                            ])
                        }
                    >
                        Session score
                    </h2>
                    { ([ 'circle', 'cross' ] as const).map(mark => (
                        <PlayerCard
                            key={ mark }
                            mark={ mark }
                            player={ game[ mark ] }
                            isMe={ mark === game.me }
                            active={ game.result?.kind === 'win' ? game.result.mark === mark : ready && !game.result && game.turn === mark }
                            activity={ activityOf(mark) }
                        />
                    )) }
                </section>
                <section
                    aria-label="Board"
                    className={
                        cn([
                            'flex flex-col items-center gap-4',
                            'md:col-start-1 md:row-span-2 md:row-start-1 md:gap-5'
                        ])
                    }
                >
                    <TurnStatus status={ status } />
                    <Board
                        game={ game }
                        onSelect={ onSelect }
                    />
                </section>
                <section
                    className={
                        cn([
                            'grid grid-cols-2 gap-2.5 self-end',
                            'md:col-start-2 md:row-start-2 md:self-start'
                        ])
                    }
                >
                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={
                            () => {
                                clearBoard({ code: gameId }).catch(onError);
                            }
                        }
                    >
                        <RotateCcw />
                        <span>
                            Clear
                            <span className="max-md:hidden"> board</span>
                        </span>
                    </Button>
                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={
                            () => {
                                newSession({ code: gameId }).catch(onError);
                            }
                        }
                    >
                        <Plus />
                        New session
                    </Button>
                    <p
                        className={
                            cn([
                                'col-span-2 text-sm text-muted-foreground',
                                'max-md:hidden'
                            ])
                        }
                    >
                        Clear board keeps the score. New session resets it to 0 : 0.
                    </p>
                </section>
            </div>
        </>
    );
};

export default GamePage;
