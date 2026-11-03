import type { FC } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import cn from '@/lib/cn';
import initials from '@/lib/initials';

type UserAvatarProps = {
    name: string,
    avatar: string,
    tone?: 'circle' | 'cross',
    size?: 'sm' | 'card' | 'md' | 'lg'
};

// sm — кнопка в шапці, card — картка рахунку на телефоні, md — на десктопі, lg — меню на телефоні
// Кегль ініціалів ставиться на AvatarFallback: у нього свій text-sm, тож на корені Avatar він не діє
const SIZE = { sm: 'size-8', card: 'size-9', md: 'size-11', lg: 'size-13' };
const INITIALS = { sm: 'text-xs', card: 'text-xs', md: 'text-sm', lg: 'text-base' };

// referrerPolicy потрібен аватаркам з googleusercontent.com: без нього вони іноді віддають 403
const UserAvatar: FC<UserAvatarProps> = ({ name, avatar, tone = 'circle', size = 'md' }) => (
    <Avatar className={ SIZE[ size ] }>
        { avatar && (
            <AvatarImage
                src={ avatar }
                alt=""
                referrerPolicy="no-referrer"
            />
        ) }
        <AvatarFallback
            className={
                cn('font-semibold text-foreground', INITIALS[ size ], {
                    'bg-border': tone === 'circle',
                    'bg-cross-soft': tone === 'cross'
                })
            }
        >
            { initials(name) }
        </AvatarFallback>
    </Avatar>
);

export default UserAvatar;
