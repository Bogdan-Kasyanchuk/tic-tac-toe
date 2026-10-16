import { Eye, EyeOff, Lock } from 'lucide-react';
import { type ComponentProps, type FC, useState } from 'react';

import IconInput from '@/components/IconInput';
import { Button } from '@/components/ui/button';
import type { Input } from '@/components/ui/input';

const PasswordInput: FC<ComponentProps<typeof Input>> = props => {
    const [ visible, setVisible ] = useState(false);

    return (
        <div className="relative">
            <IconInput
                icon={ Lock }
                type={ visible ? 'text' : 'password' }
                className="pr-11.5"
                { ...props }
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={ visible ? 'Hide password' : 'Show password' }
                className="absolute top-0 right-0.5 text-subtle hover:bg-transparent"
                onClick={
                    () => {
                        setVisible(value => !value);
                    }
                }
            >
                { visible ? <EyeOff /> : <Eye /> }
            </Button>
        </div>
    );
};

export default PasswordInput;
