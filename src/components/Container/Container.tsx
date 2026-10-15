import type { FC, ReactNode } from 'react';

const Container: FC<{ children: ReactNode }> = ({ children }) => (
    <main className="mx-auto flex w-full grow items-center justify-center p-5">
        { children }
    </main>
);

export default Container;
