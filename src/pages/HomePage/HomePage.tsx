import { nanoid } from 'nanoid';
import { type FC, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import Button from '@/components/Button';
import RadioInput from '@/components/RadioInput';
import type { Mark } from '@convex/rules';

type GameType = 'new' | 'join';

const HomePage: FC = () => {
    const [ type, setType ] = useState<GameType>('new');
    const [ code, setCode ] = useState('');
    const [ mark, setMark ] = useState<Mark>('circle');
    const navigate = useNavigate();

    // ID нової гри генерується, ID для приєднання вводиться: при перемиканні старе значення не переноситься
    const selectType = (next: GameType) => {
        setType(next);
        setCode('');
    };

    const onStart = () => {
        const trimmed = code.trim();

        if (!trimmed) {
            toast.error(type === 'new' ? 'Generate Game ID first' : 'Enter the game ID');

            return;
        }

        const path = `/game/${ encodeURIComponent(trimmed) }`;

        navigate(type === 'new' ? `${ path }?mark=${ mark }` : path);
    };

    return (
        <div className="flex w-full max-w-105 flex-col items-center gap-y-10">
            <h2 className="text-center text-4xl font-semibold uppercase">Authorization</h2>
            <div className="flex w-full flex-col gap-y-5">
                <div className="flex items-center gap-x-5">
                    <RadioInput
                        id="newGame"
                        name="type"
                        value="new"
                        label="New game"
                        checked={ type === 'new' }
                        onChange={
                            () => {
                                selectType('new');
                            }
                        }
                    />
                    <RadioInput
                        id="joinGame"
                        name="type"
                        value="join"
                        label="Join the game"
                        checked={ type === 'join' }
                        onChange={
                            () => {
                                selectType('join');
                            }
                        }
                    />
                </div>
                { type === 'new' && (
                    <div className="flex flex-col gap-y-5 pl-5">
                        <div className="flex items-center gap-x-5">
                            <RadioInput
                                id="circleTurn"
                                name="turn"
                                value="circle"
                                label="Circle"
                                checked={ mark === 'circle' }
                                onChange={
                                    () => {
                                        setMark('circle');
                                    }
                                }
                            />
                            <RadioInput
                                id="crossTurn"
                                name="turn"
                                value="cross"
                                label="Cross"
                                checked={ mark === 'cross' }
                                onChange={
                                    () => {
                                        setMark('cross');
                                    }
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-y-5">
                            <Button
                                className="w-fit px-2 py-0.5 text-lg font-semibold"
                                onClick={
                                    () => {
                                        setCode(nanoid());
                                    }
                                }
                            >
                                Generate Game ID
                            </Button>
                            { code && <p className="text-2xl font-semibold text-white">{ code }</p> }
                        </div>
                    </div>
                ) }
                { type === 'join' && (
                    <div className="pl-5">
                        <div className="text-lg leading-snug font-semibold">
                            <label
                                htmlFor="idGame"
                                className="mb-2.5 inline-block cursor-pointer uppercase"
                            >
                                Enter the game ID
                            </label>
                            <input
                                id="idGame"
                                type="text"
                                placeholder="Enter the game ID"
                                value={ code }
                                className="w-full rounded-none border border-white bg-white px-3 py-1.5 leading-6.5 outline-0 transition placeholder:text-black placeholder:opacity-30 focus:border-black focus:outline-1 focus:outline-black"
                                onChange={
                                    event => {
                                        setCode(event.target.value);
                                    }
                                }
                            />
                        </div>
                    </div>
                ) }
            </div>
            <Button
                type="submit"
                className="mx-auto w-full max-w-80"
                onClick={ onStart }
            >
                Start
            </Button>
        </div>
    );
};

export default HomePage;
