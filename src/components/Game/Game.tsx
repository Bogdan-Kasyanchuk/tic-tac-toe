/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

import { checkGame, startGame, updateGame } from 'service/firebaseOperations';

import useClear from 'hooks/useClear';
import useData from 'hooks/useData';
import useUser from 'hooks/useUser';

import Button from 'components/Button';
import Cell from 'components/Cell';
import Player from 'components/Player';
import Statistics from 'components/Statistics';
import Waiting from 'components/Waiting';

const Game: FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { circle, cross, fields, typeTurn, lineWinner, quantityUsers } = useData();
  const { displayName, photoURL } = useUser();
  const { setSession, setBoard } = useClear();

  useEffect(() => {
    if (state.type === 'new') {
      toast.success('New game');
      startGame(state.id);
      updateGame(state.id, {
        [`users.${state.turn}.name`]: displayName,
        [`users.${state.turn}.avatar`]: photoURL,
        [`users.${state.turn}.turn`]: state.turn,
      });
      return;
    }

    checkGame(state.id).then((docSnap) => {
      if (!docSnap?.exists()) {
        toast.error('Not game');
        return navigate('/');
      }

      const { users } = docSnap.data();

      if (users.quantityUsers === 2) {
        toast.error('Maximum number of players');
        return navigate('/');
      }

      const checkTurn = users.circle.turn === 'circle' ? 'cross' : 'circle';

      toast.success('Join game');

      updateGame(state.id, {
        'users.quantityUsers': 2,
        [`users.${checkTurn}.name`]: displayName,
        [`users.${checkTurn}.avatar`]: photoURL,
        [`users.${checkTurn}.turn`]: checkTurn,
      });
    });
  }, []);

  return (
    <>
      {state.type === 'new' && quantityUsers !== 2 && <Waiting />}
      <div className='c-app'>
        <div className='c-app__player-wrapper'>
          <Player player={circle} />
          <Player player={cross} />
        </div>
        <div className='c-app__statistics-wrapper'>
          <Statistics lineWinner={lineWinner} typeTurn={typeTurn} />
        </div>
        <div className='c-app__board c-board'>
          {fields?.length && fields.map((el) => <Cell key={el.id} id={el.id} type={el.type} />)}
        </div>
        <div className='c-app__button-wrapper'>
          <Button className='c-app__button' onClick={setSession}>
            New
          </Button>
          <Button className='c-app__button' onClick={setBoard}>
            Clear
          </Button>
        </div>
      </div>
    </>
  );
};

export default Game;
