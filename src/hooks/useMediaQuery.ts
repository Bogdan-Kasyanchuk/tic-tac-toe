import { useSyncExternalStore } from 'react';

export const DESKTOP = '(min-width: 48rem)';

const useMediaQuery = (query: string): boolean => useSyncExternalStore(
    onChange => {
        const list = window.matchMedia(query);

        list.addEventListener('change', onChange);

        return () => {
            list.removeEventListener('change', onChange);
        };
    },
    () => window.matchMedia(query).matches
);

export default useMediaQuery;
