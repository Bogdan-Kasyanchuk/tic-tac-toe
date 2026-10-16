import { CircleAlert } from 'lucide-react';
import type { FC, ReactNode } from 'react';

const FieldError: FC<{ children?: ReactNode }> = ({ children }) => {
    if (!children) {
        return null;
    }

    return (
        <p
            role="alert"
            className="flex items-center gap-1.5 text-sm text-danger"
        >
            <CircleAlert className="size-3.5 shrink-0" />
            { children }
        </p>
    );
};

export default FieldError;
