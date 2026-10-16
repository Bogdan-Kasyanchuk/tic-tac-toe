import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth, useMutation } from 'convex/react';
import { type FC, useState } from 'react';
import { Link, useMatch, useNavigate } from 'react-router';
import { toast } from 'sonner';

import Button from '@/components/Button';
import Modal from '@/components/Modal';
import UserMenu from '@/components/UserMenu';
import cn from '@/lib/cn';
import errorMessage from '@/lib/errorMessage';
import { api } from '@convex/_generated/api';

type ModalType = 'logOut' | 'goHome';

const HEADER_BUTTON = 'px-3.5 py-0.5 text-lg';

const NavBar: FC = () => {
    const { isAuthenticated } = useConvexAuth();
    const { signOut } = useAuthActions();
    const leave = useMutation(api.games.leave);
    const matchLogin = useMatch('/login');
    const matchGame = useMatch('/game/:gameId');
    const navigate = useNavigate();
    const [ isMenu, setIsMenu ] = useState(false);
    const [ modalType, setModalType ] = useState<ModalType | null>(null);

    const gameCode = matchGame?.params.gameId;

    const openModal = (type: ModalType) => {
        setModalType(type);
        setIsMenu(false);
    };

    // Спершу йдемо на `/`, щоб сторінка гри не показала спінер для гри, якої для нас уже немає
    const onOk = async () => {
        const type = modalType;

        setModalType(null);
        navigate('/');

        try {
            if (gameCode) {
                await leave({ code: gameCode });
            }
        } catch (error) {
            toast.error(errorMessage(error));
        }

        // Підтверджений Logout розлогінює, навіть якщо вихід із гри не вдався
        if (type === 'logOut') {
            try {
                await signOut();
            } catch (error) {
                toast.error(errorMessage(error));
            }
        }
    };

    return (
        <div>
            <header className="flex items-center justify-between gap-x-5 border-b-4 border-black bg-linear-to-r/srgb from-blue-dark px-5 py-3">
                <Link to="/">
                    <h1
                        className={
                            cn([
                                'text-2xl font-semibold text-white uppercase',
                                'md:text-3xl'
                            ])
                        }
                    >
                        Tic-Tac-Toe
                    </h1>
                </Link>
                <div className="flex items-center gap-x-5">
                    { isAuthenticated && gameCode && (
                        <div className="relative">
                            <Button
                                className={ HEADER_BUTTON }
                                onClick={
                                    () => {
                                        setIsMenu(!isMenu);
                                    }
                                }
                            >
                                Menu
                            </Button>
                            { isMenu && (
                                <UserMenu
                                    gameCode={ gameCode }
                                    onClose={
                                        () => {
                                            setIsMenu(false);
                                        }
                                    }
                                    onGoHome={
                                        () => {
                                            openModal('goHome');
                                        }
                                    }
                                    onLogOut={
                                        () => {
                                            openModal('logOut');
                                        }
                                    }
                                />
                            ) }
                        </div>
                    ) }
                    { isAuthenticated && !gameCode && (
                        <Button
                            className={ HEADER_BUTTON }
                            onClick={
                                () => {
                                    openModal('logOut');
                                }
                            }
                        >
                            Logout
                        </Button>
                    ) }
                    { !isAuthenticated && (
                        <Link to={ matchLogin ? '/' : '/login' }>
                            <Button className={ HEADER_BUTTON }>
                                { matchLogin ? 'Home' : 'Login' }
                            </Button>
                        </Link>
                    ) }
                </div>
            </header>
            { modalType && (
                <Modal
                    onOk={ onOk }
                    onClose={
                        () => {
                            setModalType(null);
                        }
                    }
                >
                    { modalType === 'logOut'
                        ? 'Are you sure what you want to go out? '
                        : 'Are you sure you want to go to the home page? ' }
                    The current game will be ended!
                </Modal>
            ) }
        </div>
    );
};

export default NavBar;
