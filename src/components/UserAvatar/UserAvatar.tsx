import type { FC } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import cn from '@/lib/cn';
import initials from '@/lib/initials';

type UserAvatarProps = {
    name: string,
    avatar: string,
    tone?: 'circle' | 'cross',
    size?: 'sm' | 'md' | 'lg'
};

const SIZE = { sm: 'size-8 text-xs', md: 'size-11 text-sm', lg: 'size-13 text-base' };

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
                cn('font-semibold text-foreground', {
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
