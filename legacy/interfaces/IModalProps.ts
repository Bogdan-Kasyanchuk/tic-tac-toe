import { ReactNode } from 'react';

export interface IModalProps {
  modalHundler: () => void;
  onOk: () => void;
  children: ReactNode;
}
