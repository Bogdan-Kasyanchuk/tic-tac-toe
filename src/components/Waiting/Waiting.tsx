import { LoaderCircle } from 'lucide-react';
import type { FC } from 'react';

// Тимчасово без Overlay і react-loader-spinner: компонент видаляється в задачі 8
const Waiting: FC<{ code: string }> = ({ code }) => (
    <div className="fixed inset-0 top-15 z-20 flex items-center justify-center">
        <div className="flex w-[85vw] max-w-100 flex-col items-center border border-white bg-blue-dark p-5">
            <p className="text-center text-2xl text-white">Waiting the second player</p>
            <LoaderCircle
                aria-label="Loading"
                className="my-6 size-16 animate-spin text-blue-200"
            />
            <p className="text-xl text-white">Want to add a second player? Copy and send the game ID:</p>
            <p className="text-xl text-white">{ code }</p>
        </div>
    </div>
);

export default Waiting;
