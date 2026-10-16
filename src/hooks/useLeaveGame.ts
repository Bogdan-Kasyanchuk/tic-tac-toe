import { useAuthActions } from '@convex-dev/auth/react';
import { useMutation } from 'convex/react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import errorMessage from '@/lib/errorMessage';
import { api } from '@convex/_generated/api';

export type LeaveIntent = 'lobby' | 'signOut';

const useLeaveGame = (gameCode: string | null) => {
    const { signOut } = useAuthActions();
    const leave = useMutation(api.games.leave);
    const navigate = useNavigate();

    return async (intent: LeaveIntent) => {
        // Спершу йдемо на `/`, щоб сторінка гри не показала спінер для гри, якої для нас уже немає
        navigate('/');

        if (gameCode) {
            try {
                await leave({ code: gameCode });
            } catch (error) {
                toast.error(errorMessage(error));
            }
        }

        // Підтверджений вихід розлогінює, навіть якщо вихід із гри не вдався
        if (intent === 'signOut') {
            try {
                await signOut();
            } catch (error) {
                toast.error(errorMessage(error));
            }
        }
    };
};

export default useLeaveGame;
