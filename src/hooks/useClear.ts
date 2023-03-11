import { useLocation } from 'react-router-dom';

import { updateGame } from 'service/firebaseOperations';

import generateFields from 'helpers/generateFields';

const useClear = (): { setSession: () => void; setBoard: () => void } => {
  const { state } = useLocation();

  const setSession = () => {
    updateGame(state.id, {
      fields: generateFields(),
      'users.circle.countWinner': 0,
      'users.cross.countWinner': 0,
      typeTurn: 'circle',
      idWinner: [],
      lineWinner: '',
    });
  };

  const setBoard = () => {
    updateGame(state.id, {
      fields: generateFields(),
      typeTurn: 'circle',
      idWinner: [],
      lineWinner: '',
    });
  };

  return { setSession, setBoard };
};

export default useClear;
