import { FC, MouseEvent } from 'react';
import { createPortal } from 'react-dom';

import useKeyDown from 'hooks/useKeyDown';

import Button from 'components/Button';

import { IModalProps } from 'interfaces';

const modalRoot = document.querySelector('#root-modal') as HTMLDivElement;

const Modal: FC<IModalProps> = ({ modalHundler, onOk, children }) => {
  useKeyDown(modalHundler);

  const onClickBackdrop = (e: MouseEvent<HTMLDivElement>) => {
    if (e.currentTarget === e.target) {
      modalHundler();
    }
  };

  return createPortal(
    <div className='c-overlay' onClick={onClickBackdrop}>
      <div className='c-modal'>
        <button className='c-modal__close-button' onClick={modalHundler} aria-label='Close modal' />
        <div className='c-modal__content'>{children}</div>
        <div className='c-modal__button-wrapper'>
          <Button className='c-modal__button' onClick={onOk}>
            Ok
          </Button>
          <Button className='c-modal__button' onClick={modalHundler}>
            Cancel
          </Button>
        </div>
      </div>
    </div>,
    modalRoot,
  );
};

export default Modal;
