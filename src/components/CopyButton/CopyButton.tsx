import { Check, Copy } from 'lucide-react';
import { type FC, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { copyText } from '@/lib/invite';

type CopyButtonProps = {
    text: string,
    label: string,
    success: string
};

const CopyButton: FC<CopyButtonProps> = ({ text, label, success }) => {
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
            size="icon"
            aria-label={ label }
            onClick={
                async () => {
                    await copyText(text, success);
                    setCopied(true);
                }
            }
        >
            { copied ? <Check /> : <Copy /> }
        </Button>
    );
};

export default CopyButton;
