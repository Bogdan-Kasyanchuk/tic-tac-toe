import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@/index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <p className="p-5 text-2xl font-semibold uppercase">Tic-Tac-Toe</p>
    </StrictMode>
);
