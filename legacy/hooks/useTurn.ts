import { increment } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';

import { updateGame } from 'service/firebaseOperations';

import useClear from 'hooks/useClear';
import useData from 'hooks/useData';
import useUser from 'hooks/useUser';

import checkWinner from 'helpers/checkWinner';

import type { TField } from 'types';

const useTurn = (): { setTurn: (cellId: TField['id']) => void } => {
  const { state } = useLocation();
  const { circle, cross, fields, typeTurn, lineWinner, quantityUsers } = useData();
  const { displayName } = useUser();
  const { setBoard } = useClear();

  const setTurn = (cellId: TField['id']) => {
    if (
      quantityUsers < 2 ||
      lineWinner ||
      (displayName !== circle.name && circle.turn === typeTurn) ||
      (displayName !== cross.name && cross.turn === typeTurn)
    ) {
      return;
    }

    const newFields: TField[] = fields.map((el) => {
      if (el.id === cellId) return { ...el, type: typeTurn === 'circle' ? 'circle' : 'cross' };
      return el;
    });

    const { winnerType, winnerId } = checkWinner(newFields);

    if (winnerType) {
      updateGame(state.id, {
        fields: newFields,
        [`users.${typeTurn}.countWinner`]: increment(1),
        typeTurn: typeTurn === 'circle' ? 'cross' : 'circle',
        idWinner: winnerId,
        lineWinner: winnerType,
      });
      const timeoutID = setTimeout(() => {
        setBoard();
        clearTimeout(timeoutID);
      }, 1500);
    } else {
      updateGame(state.id, {
        fields: newFields,
        typeTurn: typeTurn === 'circle' ? 'cross' : 'circle',
      });
    }
  };

  return { setTurn };
};

export default useTurn;
