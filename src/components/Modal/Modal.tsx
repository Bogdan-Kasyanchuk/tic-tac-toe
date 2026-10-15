import type { FC, MouseEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';

import Button from '@/components/Button';
import Overlay from '@/components/Overlay';
import useEscapeKey from '@/hooks/useEscapeKey';

type ModalProps = {
    children: ReactNode,
    onClose: () => void,
    onOk: () => void
};

const Modal: FC<ModalProps> = ({ children, onClose, onOk }) => {
    useEscapeKey(onClose);

    const onClickBackdrop = (event: MouseEvent<HTMLDivElement>) => {
        if (event.currentTarget === event.target) {
            onClose();
        }
    };

    return createPortal(
        <Overlay onClick={ onClickBackdrop }>
            <div className="flex w-[85vw] max-w-125 flex-col gap-y-10 border border-white bg-blue-dark p-5">
                <button
                    type="button"
                    aria-label="Close modal"
                    className="relative z-21 flex h-8 w-8 items-center justify-center self-end bg-blue-50 transition before:absolute before:h-0.5 before:w-4/5 before:rotate-45 before:bg-black after:absolute after:h-0.5 after:w-4/5 after:-rotate-45 after:bg-black hover:bg-blue-200"
                    onClick={ onClose }
                />
                <div className="text-center text-3xl text-white">
                    { children }
                </div>
                <div className="flex flex-wrap justify-around gap-5">
                    <Button onClick={ onOk }>Ok</Button>
                    <Button onClick={ onClose }>Cancel</Button>
                </div>
            </div>
        </Overlay>,
        document.getElementById('root-modal')!
    );
};

export default Modal;
