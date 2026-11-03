import { Check, Copy } from 'lucide-react';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import useCopy from '@/hooks/useCopy';

type CopyButtonProps = {
    text: string,
    label: string,
    success: string
};

const CopyButton: FC<CopyButtonProps> = ({ text, label, success }) => {
    const { copied, copy } = useCopy(text, success);

    return (
        <Button
            variant="secondary"
            size="icon"
            aria-label={ label }
            onClick={
                () => {
                    void copy();
                }
            }
        >
            { copied ? <Check /> : <Copy /> }
        </Button>
    );
};

export default CopyButton;
