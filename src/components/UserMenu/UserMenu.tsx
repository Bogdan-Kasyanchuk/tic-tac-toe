import { useQuery } from 'convex/react';
import type { FC, MouseEvent } from 'react';

import Overlay from '@/components/Overlay';
import useEscapeKey from '@/hooks/useEscapeKey';
import { api } from '@convex/_generated/api';

const ITEM = 'px-4 text-lg leading-loose whitespace-nowrap text-black';
const ACTION = `${ ITEM } cursor-pointer transition hover:bg-blue-dark hover:text-white`;

type UserMenuProps = {
    gameCode: string,
    onClose: () => void,
    onGoHome: () => void,
    onLogOut: () => void
};

const UserMenu: FC<UserMenuProps> = ({ gameCode, onClose, onGoHome, onLogOut }) => {
    const me = useQuery(api.users.me);

    useEscapeKey(onClose);

    const onClickOutside = (event: MouseEvent<HTMLDivElement>) => {
        if (event.currentTarget === event.target) {
            onClose();
        }
    };

    return (
        <>
            <div className="absolute right-0 z-50">
                <div className="mt-2.5 min-w-30 max-w-[calc(100vw-40px)] bg-blue-50">
                    <ul className="m-0 list-none p-0">
                        <li className="px-4 text-base leading-loose whitespace-nowrap text-black">
                            { gameCode }
                        </li>
                        <li className={ `${ ITEM } border-b border-black` }>
                            { me?.name }
                        </li>
                        <li className={ ACTION }>
                            <button
                                type="button"
                                className="w-full text-left"
                                onClick={ onGoHome }
                            >
                                Home
                            </button>
                        </li>
                        <li className={ ACTION }>
                            <button
                                type="button"
                                className="w-full text-left"
                                onClick={ onLogOut }
                            >
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
            <Overlay
                className="z-21 block bg-transparent"
                onClick={ onClickOutside }
            />
        </>
    );
};

export default UserMenu;
