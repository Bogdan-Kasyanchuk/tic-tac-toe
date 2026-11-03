import { useEffect, useState } from 'react';

import { copyText } from '@/lib/invite';

// Копіює текст і на 1.5 с вмикає `copied`, щоб кнопка показала галочку замість іконки копіювання
const useCopy = (text: string, success: string) => {
    const [ copied, setCopied ] = useState(false);

    useEffect(
        () => {
            if (!copied) {
                return;
            }

            const timer = setTimeout(() => {
                setCopied(false);
            }, 1500);

            return () => {
                clearTimeout(timer);
            };
        },
        [ copied ]
    );

    const copy = async () => {
        await copyText(text, success);
        setCopied(true);
    };

    return { copied, copy };
};

export default useCopy;
