import type { FC } from 'react';

import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import type { LeaveIntent } from '@/hooks/useLeaveGame';

const COPY: Record<LeaveIntent, { title: string, action: string }> = {
    lobby: { title: 'Leave the game?', action: 'Leave game' },
    signOut: { title: 'Sign out?', action: 'Sign out' }
};

type LeaveGameDialogProps = {
    intent: LeaveIntent | null,
    onCancel: () => void,
    onConfirm: () => void
};

const LeaveGameDialog: FC<LeaveGameDialogProps> = ({ intent, onCancel, onConfirm }) => {
    const copy = COPY[ intent ?? 'lobby' ];

    return (
        <AlertDialog
            open={ intent !== null }
            onOpenChange={
                open => {
                    if (!open) {
                        onCancel();
                    }
                }
            }
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-display text-2xl font-bold">{ copy.title }</AlertDialogTitle>
                    <AlertDialogDescription>The current game ends for both players, and the score is lost.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel variant="secondary">Stay</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        onClick={ onConfirm }
                    >
                        { copy.action }
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default LeaveGameDialog;
