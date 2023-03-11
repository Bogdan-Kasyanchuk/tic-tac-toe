import { FC, ReactNode } from 'react';

const Container: FC<{ children: ReactNode }> = ({ children }) => {
  return <main className='c-container'>{children}</main>;
};

export default Container;
