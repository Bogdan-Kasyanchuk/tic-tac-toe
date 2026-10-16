import { Check, Copy } from 'lucide-react';
import { type FC, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { copyText } from '@/lib/invite';

type CopyButtonProps = {
    text: string,
    label: string,
    success: string,
    // Видимий підпис поруч з іконкою (діалог очікування на десктопі); без нього кнопка квадратна
    caption?: string
};

const CopyButton: FC<CopyButtonProps> = ({ text, label, success, caption }) => {
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

    return (
        <Button
            variant="secondary"
            size={ caption ? 'default' : 'icon' }
            aria-label={ label }
            className={ caption ? 'h-12 px-4 text-sm' : undefined }
            onClick={
                async () => {
                    await copyText(text, success);
                    setCopied(true);
                }
            }
        >
            { copied ? <Check /> : <Copy /> }
            { caption }
        </Button>
    );
};

export default CopyButton;
