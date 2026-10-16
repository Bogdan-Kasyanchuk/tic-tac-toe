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
        'Play live. The score keeps counting until a new session.'
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
                    'mx-auto flex w-full max-w-244 flex-col gap-6',
                    'md:gap-9 md:pt-4'
                ])
            }
        >
            <div className="flex flex-col gap-2.5">
                <h1
                    className={
                        cn([
                            'font-display text-3xl leading-tight font-extrabold tracking-tight',
                            'md:text-5xl'
                        ])
                    }
                >
                    { `Ready for a round, ${ firstName(me?.name ?? '') }?` }
                </h1>
                <p className="text-muted-foreground">
                    Start a new game, or join a friend with
                    <span
                        className={
                            cn([
                                'hidden',
                                'md:inline'
                            ])
                        }
                    >
                        { ' the ID they sent you' }
                    </span>
                    <span className="md:hidden">{ ' their ID' }</span>
                    .
                </p>
            </div>
            <div className="flex flex-wrap items-start gap-6">
                <section
                    aria-label="Start a game"
                    className={
                        cn([
                            'flex min-w-0 flex-[999_1_32rem] flex-col gap-6',
                            'md:rounded-2xl md:border md:border-line md:bg-card md:p-7'
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
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-label">Game ID</span>
                                <div className="flex gap-2">
                                    <p className="h-11 min-w-0 flex-1 truncate rounded-lg border border-dashed border-border bg-field px-3.5 font-mono leading-11 font-medium">
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
                                <p className="text-sm text-muted-foreground">Generated for you. Your friend joins with this ID.</p>
                            </div>
                            <Button
                                size="lg"
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
                                className="flex flex-col gap-6"
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
                                        : <p className="text-sm text-muted-foreground">Opened an invite link? The ID is filled in for you.</p> }
                                </div>
                                { /* Сервер сам віддає вільну позначку, тож «Cross» з канвасу тут не обіцяємо */ }
                                <div
                                    role="note"
                                    className="flex items-center gap-3.5 rounded-xl border border-line bg-field px-4 py-3.5"
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
                                    size="lg"
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
                            'md:flex md:flex-[1_1_18rem] md:flex-col md:gap-5 md:rounded-2xl md:border md:border-line md:p-7'
                        ])
                    }
                >
                    <h2 className="font-display text-xl font-bold">How it works</h2>
                    <ol className="flex flex-col gap-4.5">
                        { STEPS[ type ].map((step, index) => (
                            <li
                                key={ step }
                                className="flex gap-3.5"
                            >
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-link">
                                    { index + 1 }
                                </span>
                                <span className="leading-normal text-label">{ step }</span>
                            </li>
                        )) }
                    </ol>
                </aside>
            </div>
        </div>
    );
};

export default HomePage;
