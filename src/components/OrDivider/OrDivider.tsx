import type { FC } from 'react';

const OrDivider: FC = () => (
    <div className="flex items-center gap-3 text-sm text-subtle">
        <span className="h-px flex-1 bg-border" />
        or with email
        <span className="h-px flex-1 bg-border" />
    </div>
);

export default OrDivider;
