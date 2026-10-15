import { useMutation, useQuery } from 'convex/react';
import { type FC, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import Button from '@/components/Button';
import Cell from '@/components/Cell';
import Player from '@/components/Player';
import Spinner from '@/components/Spinner';
import Statistics from '@/components/Statistics';
import Waiting from '@/components/Waiting';
import cn from '@/lib/cn';
import errorMessage from '@/lib/errorMessage';
import { api } from '@convex/_generated/api';

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

    const winLine = game.result?.kind === 'win' ? game.result : null;

    return (
        <>
            { (!game.circle || !game.cross) && <Waiting code={ game.code } /> }
            <div
                className={
                    cn([
                        'w-full',
                        'md:w-175'
                    ])
                }
            >
                <div
                    className={
                        cn([
                            'mb-2.5 flex flex-col gap-y-5 border-b-2 pb-2.5',
                            'md:mb-5 md:pb-5'
                        ])
                    }
                >
                    <Player
                        mark="circle"
                        player={ game.circle }
                    />
                    <Player
                        mark="cross"
                        player={ game.cross }
                    />
                </div>
                <Statistics
                    turn={ game.turn }
                    result={ game.result }
                />
                <div
                    className={
                        cn([
                            'mx-auto my-8 grid h-60 w-60 grid-cols-3 grid-rows-3 gap-0.5 bg-black',
                            'md:h-125 md:w-125'
                        ])
                    }
                >
                    { game.board.map((value, index) => (
                        <Cell
                            key={ index }
                            index={ index }
                            value={ value }
                            winLine={ winLine }
                            onSelect={ onSelect }
                        />
                    )) }
                </div>
                <div className="flex justify-evenly">
                    <Button
                        className="basis-1/3"
                        onClick={
                            () => {
                                newSession({ code: gameId }).catch(onError);
                            }
                        }
                    >
                        New
                    </Button>
                    <Button
                        className="basis-1/3"
                        onClick={
                            () => {
                                clearBoard({ code: gameId }).catch(onError);
                            }
                        }
                    >
                        Clear
                    </Button>
                </div>
            </div>
        </>
    );
};

export default GamePage;
