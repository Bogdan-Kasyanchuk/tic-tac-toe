import type { FC } from 'react';
import { ProgressBar } from 'react-loader-spinner';

import Overlay from '@/components/Overlay';

const Waiting: FC<{ code: string }> = ({ code }) => (
    <Overlay className="top-15 bg-transparent">
        <div className="flex w-[85vw] max-w-100 flex-col items-center border border-white bg-blue-dark p-5">
            <p className="text-center text-2xl text-white">Waiting the second player</p>
            <ProgressBar
                height="100"
                width="100"
                borderColor="#bfdbfe"
                barColor="#bfdbfe"
                ariaLabel="progress-bar-loading"
            />
            <p className="text-xl text-white">Want to add a second player? Copy and send the game ID:</p>
            <p className="text-xl text-white">{ code }</p>
        </div>
    </Overlay>
);

export default Waiting;
