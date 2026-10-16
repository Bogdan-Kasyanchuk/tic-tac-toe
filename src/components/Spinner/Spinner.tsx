import { LoaderCircle } from 'lucide-react';
import type { FC } from 'react';

const Spinner: FC = () => (
    <div className="flex grow items-center justify-center py-20">
        <LoaderCircle
            aria-label="Loading"
            className="size-8 animate-spin text-muted-foreground"
        />
    </div>
);

export default Spinner;
