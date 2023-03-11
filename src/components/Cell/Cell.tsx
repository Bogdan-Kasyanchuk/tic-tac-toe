import { FC } from 'react';

import useData from 'hooks/useData';
import useTurn from 'hooks/useTurn';

import TransitionWrapper from 'components/TransitionWrapper';

import { ICellProps } from 'interfaces';

import type { TLineWinner } from 'types';

const Cell: FC<ICellProps> = ({ id, type }) => {
  const { idWinner, lineWinner } = useData();
  const { setTurn } = useTurn();

  const winnerCell = (): TLineWinner =>
    type && lineWinner && idWinner?.includes(id) ? lineWinner : '';

  return (
    <div className={`c-board__cell ${type && 'pointer-events-none'}`} onClick={() => setTurn(id)}>
      <TransitionWrapper inProp={type === 'circle'}>
        {(s) => <div className={`c-board__cell-circle u-trans ${s}`} />}
      </TransitionWrapper>
      <TransitionWrapper inProp={type === 'cross'}>
        {(s) => (
          <div className={`c-board__cell-cross-wrapper u-trans ${s}`}>
            <div className='c-board__cell-cross' />
            <div className='c-board__cell-cross' />
          </div>
        )}
      </TransitionWrapper>
      <TransitionWrapper inProp={winnerCell() === 'horizontal'}>
        {(s) => (
          <div className={`c-board__cell-active c-board__cell-active--horizontal u-trans ${s}`} />
        )}
      </TransitionWrapper>
      <TransitionWrapper inProp={winnerCell() === 'vertical'}>
        {(s) => (
          <div className={`c-board__cell-active c-board__cell-active--vertical u-trans ${s}`} />
        )}
      </TransitionWrapper>
      <TransitionWrapper inProp={winnerCell() === 'rotate_45'}>
        {(s) => (
          <div className={`c-board__cell-active c-board__cell-active--rotate_45 u-trans ${s}`} />
        )}
      </TransitionWrapper>
      <TransitionWrapper inProp={winnerCell() === 'rotate_-45'}>
        {(s) => (
          <div className={`c-board__cell-active c-board__cell-active--rotate_-45 u-trans ${s}`} />
        )}
      </TransitionWrapper>
    </div>
  );
};

export default Cell;
