import { LoaderCircle } from 'lucide-react';
import type { FC } from 'react';

// Завжди по центру вікна: лоадер входу (App) і лоадер гри (усередині AppLayout) стоять в одній точці, без стрибка.
// pointer-events-none — шапка над лоадером гри лишається клікабельною
const Spinner: FC = () => (
    <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <LoaderCircle
            aria-label="Loading"
            className="size-8 animate-spin text-muted-foreground"
        />
    </div>
);

export default Spinner;
