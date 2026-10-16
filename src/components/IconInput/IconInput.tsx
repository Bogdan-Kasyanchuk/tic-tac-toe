import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, FC } from 'react';

import { Input } from '@/components/ui/input';
import cn from '@/lib/cn';

type IconInputProps = ComponentProps<typeof Input> & { icon: LucideIcon };

// Іконка зліва в полі — лише на десктопі, як на канвасі; ref від register доходить до Input через props
const IconInput: FC<IconInputProps> = ({ icon: Icon, className, ...props }) => (
    <div className="relative">
        <Icon
            aria-hidden="true"
            strokeWidth={ 1.75 }
            className={
                cn([
                    'pointer-events-none absolute top-3.25 left-3.5 hidden size-4.5 text-subtle',
                    'md:block'
                ])
            }
        />
        <Input
            className={ cn('md:pl-10.5', className) }
            { ...props }
        />
    </div>
);

export default IconInput;
