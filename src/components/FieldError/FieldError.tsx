import { CircleAlert } from 'lucide-react';
import type { FC, ReactNode } from 'react';

const FieldError: FC<{ children?: ReactNode }> = ({ children }) => {
    if (!children) {
        return null;
    }

    return (
        <p
            role="alert"
            className="-mt-1 flex items-center gap-1 text-xs text-danger"
        >
            <CircleAlert className="size-3 shrink-0" />
            { children }
        </p>
    );
};

export default FieldError;
