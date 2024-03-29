import { ReactNode } from 'react';

export interface IButtonProps {
  children: ReactNode;
  type?: 'button' | 'submit';
  className?: string;
  onClick?: () => void;
}
