import { FC } from 'react';

import { IButtonProps } from 'interfaces';

const Button: FC<IButtonProps> = ({ children, className, onClick, type = 'button' }) => {
  return (
    <button type={type} className={`c-button ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
