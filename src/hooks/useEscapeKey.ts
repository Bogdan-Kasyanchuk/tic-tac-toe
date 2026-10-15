import { useEffect, useEffectEvent } from 'react';

const useEscapeKey = (handler: () => void) => {
    const onEscape = useEffectEvent(handler);

    useEffect(
        () => {
            const onKeyDown = (event: KeyboardEvent) => {
                if (event.code === 'Escape') {
                    onEscape();
                }
            };

            window.addEventListener('keydown', onKeyDown);
            document.body.style.overflow = 'hidden';

            return () => {
                window.removeEventListener('keydown', onKeyDown);
                document.body.style.overflow = 'auto';
            };
        },
        []
    );
};

export default useEscapeKey;
