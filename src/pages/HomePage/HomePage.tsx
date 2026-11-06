import { useQuery } from 'convex/react';
import { ArrowRight, ClipboardPaste, RefreshCw } from 'lucide-react';
import { nanoid } from 'nanoid';
import { type FC, type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import CopyButton from '@/components/CopyButton';
import FieldError from '@/components/FieldError';
import MarkIcon from '@/components/MarkIcon';
import MarkPicker from '@/components/MarkPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useMediaQuery, { DESKTOP } from '@/hooks/useMediaQuery';
import cn from '@/lib/cn';
import { firstName } from '@/lib/initials';
import { api } from '@convex/_generated/api';
import type { Mark } from '@convex/rules';

type GameType = 'new' | 'join';

const STEPS: Record<GameType, string[]> = {
    new: [
        'Pick your mark and create a game.',
        'Send the game ID or invite link to a friend.',
        'Play live. The score keeps counting until you start a new session.'
    ],
    join: [
        'Paste the game ID, or open the invite link.',
        'You take the mark your friend left free.',
        'Play live. The score keeps counting until you start a new session.'
    ]
};

const HomePage: FC = () => {
    const me = useQuery(api.users.me);
    const navigate = useNavigate();
    const isDesktop = useMediaQuery(DESKTOP);
    const [ type, setType ] = useState<GameType>('new');
    const [ mark, setMark ] = useState<Mark>('circle');
    // У кожної вкладки свій ID: введений на Join ніколи не стає ID нової гри
    const [ newCode, setNewCode ] = useState(() => nanoid());
    const [ joinCode, setJoinCode ] = useState('');
    const [ joinError, setJoinError ] = useState<string | null>(null);

    const onJoin = (event: FormEvent) => {
        event.preventDefault();

        const code = joinCode.trim();

        if (!code) {
            setJoinError('Enter the game ID');

            return;
        }

        navigate(`/game/${ encodeURIComponent(code) }`);
    };

    const onPaste = async () => {
        try {
            setJoinCode((await navigator.clipboard.readText()).trim());
            setJoinError(null);
        } catch {
            toast.error('Could not read the clipboard');
        }
    };

    return (
        <div
            className={
                cn([
                    'mx-auto flex w-full max-w-250 flex-col gap-7',
                    'md:gap-8'
                ])
            }
        >
            <div className="flex flex-col gap-3">
                <h1
                    className={
                        cn([
                            'font-display text-4xl font-extrabold tracking-title',
                            'md:text-page-title'
                        ])
                    }
                >
                    { `Ready for a round, ${ firstName(me?.name ?? '') }?` }
                </h1>
                <p
                    className={
                        cn([
                            'text-muted-foreground',
                            'md:text-lg'
                        ])
                    }
                >
                    Start a new game, or join a friend with the ID they sent you.
                </p>
            </div>
            <div className="flex flex-wrap items-start gap-6">
                <section
                    aria-label="Start a game"
                    className={
                        cn([
                            'flex min-w-0 flex-[999_1_32.5rem] flex-col',
                            'md:rounded-3xl md:border md:border-line md:bg-card md:p-6'
                        ])
                    }
                >
                    <Tabs
                        value={ type }
                        onValueChange={
                            value => {
                                setType(value as GameType);
                            }
                        }
                    >
                        <TabsList aria-label="Game type">
                            <TabsTrigger value="new">New game</TabsTrigger>
                            <TabsTrigger value="join">Join a game</TabsTrigger>
                        </TabsList>
                        <TabsContent value="new">
                            <MarkPicker
                                value={ mark }
                                onChange={ setMark }
                            />
                            <div
                                className={
                                    cn([
                                        'flex flex-col gap-2',
                                        'md:gap-3'
                                    ])
                                }
                            >
                                <span className="text-sm leading-none font-medium text-label">Game ID</span>
                                <div className="flex gap-2">
                                    <p
                                        title={ newCode }
                                        className="h-12.5 min-w-0 flex-1 truncate rounded-lg border border-border bg-field px-4 font-mono text-lg leading-12 font-medium"
                                    >
                                        { newCode }
                                    </p>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        aria-label="Generate a new game ID"
                                        onClick={
                                            () => {
                                                setNewCode(nanoid());
                                            }
                                        }
                                    >
                                        <RefreshCw />
                                    </Button>
                                    <CopyButton
                                        text={ newCode }
                                        label="Copy game ID"
                                        success="Game ID copied"
                                    />
                                </div>
                                <p
                                    className={
                                        cn([
                                            '-mt-1 text-sm text-muted-foreground',
                                            'md:-mt-2'
                                        ])
                                    }
                                >
                                    Generated for you. Your friend joins with this ID.
                                </p>
                            </div>
                            <Button
                                className={
                                    cn([
                                        'mt-2',
                                        'md:mt-0'
                                    ])
                                }
                                onClick={
                                    () => {
                                        navigate(`/game/${ encodeURIComponent(newCode) }?mark=${ mark }`);
                                    }
                                }
                            >
                                Create game
                                <ArrowRight />
                            </Button>
                        </TabsContent>
                        <TabsContent value="join">
                            <form
                                className={
                                    cn([
                                        'flex flex-col gap-5',
                                        'md:gap-6'
                                    ])
                                }
                                noValidate
                                onSubmit={ onJoin }
                            >
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="join-code">Game ID</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="join-code"
                                            autoComplete="off"
                                            spellCheck={ false }
                                            placeholder={ isDesktop ? 'Paste the ID your friend sent' : 'Paste the ID' }
                                            className="font-mono font-medium"
                                            aria-invalid={ joinError ? true : undefined }
                                            value={ joinCode }
                                            onChange={
                                                event => {
                                                    setJoinCode(event.target.value);
                                                    setJoinError(null);
                                                }
                                            }
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="icon"
                                            aria-label="Paste from clipboard"
                                            onClick={
                                                () => {
                                                    void onPaste();
                                                }
                                            }
                                        >
                                            <ClipboardPaste />
                                        </Button>
                                    </div>
                                    { joinError
                                        ? <FieldError>{ joinError }</FieldError>
                                        : <p className="-mt-1 text-sm text-muted-foreground">Opened an invite link? The ID is filled in for you.</p> }
                                </div>
                                { /* Сервер сам віддає вільну позначку, тож «Cross» з канвасу тут не обіцяємо */ }
                                <div
                                    role="note"
                                    className="flex h-20 shrink-0 items-center gap-4 rounded-2xl border border-line bg-field px-4"
                                >
                                    <MarkIcon
                                        mark="cross"
                                        className="size-8 shrink-0"
                                    />
                                    <span className="flex flex-col gap-1">
                                        <span className="font-semibold">You play as the free mark</span>
                                        <span className="text-sm text-muted-foreground">Circle moves first.</span>
                                    </span>
                                </div>
                                <Button
                                    type="submit"
                                    className={
                                        cn([
                                            'mt-2',
                                            'md:mt-0'
                                        ])
                                    }
                                >
                                    Join game
                                    <ArrowRight />
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </section>
                <aside
                    className={
                        cn([
                            'hidden',
                            'md:flex md:flex-[1_1_18.75rem] md:flex-col md:gap-5 md:rounded-3xl md:border md:border-line md:p-6'
                        ])
                    }
                >
                    <h2 className="font-display text-logo font-bold">How it works</h2>
                    <ol className="flex flex-col gap-5">
                        { STEPS[ type ].map((step, index) => (
                            <li
                                key={ step }
                                className="flex gap-3"
                            >
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-link">
                                    { index + 1 }
                                </span>
                                <span className="text-label">{ step }</span>
                            </li>
                        )) }
                    </ol>
                </aside>
            </div>
        </div>
    );
};

export default HomePage;
