import { nanoid } from 'nanoid';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from 'components/Button';
import RadioInput from 'components/RadioInput';

import type { TIdGame, TTypeGame, TTypeTurn } from 'types';

const Home: FC = () => {
  const [type, setType] = useState<TTypeGame>('new');
  const [id, setId] = useState<TIdGame>('');
  const [turn, setTurn] = useState<TTypeTurn>('circle');
  const navigate = useNavigate();

  const onSubmit = () => {
    navigate(
      `/game/${id}`,
      type === 'new' ? { state: { id, type, turn } } : { state: { id, type } },
    );
  };

  return (
    <div className='c-home'>
      <h2 className='c-home__title'>Authorization</h2>
      <div className='c-home__choice'>
        <div className='c-home__choice-type'>
          <RadioInput
            id='newGame'
            checked={type === 'new'}
            name='type'
            value='new'
            handlerInput={() => setType('new')}
            label='New game'
          />
          <RadioInput
            id='joinGame'
            checked={type === 'join'}
            name='type'
            value='join'
            handlerInput={() => setType('join')}
            label='Join the game'
          />
        </div>
        {type === 'new' && (
          <div className='c-home__choice-new'>
            <div className='c-home__choice-new-turn'>
              <RadioInput
                id='circleTurn'
                checked={turn === 'circle'}
                name='turn'
                value='circle'
                handlerInput={() => setTurn('circle')}
                label='Circle'
              />
              <RadioInput
                id='crossTurn'
                checked={turn === 'cross'}
                name='turn'
                value='cross'
                handlerInput={() => setTurn('cross')}
                label='Cross'
              />
            </div>
            <div className='c-home__generate-id'>
              <Button onClick={() => setId(nanoid())} className='c-home__generate-id-button'>
                Generate Game ID
              </Button>
              {id && <p className='c-home__generate-id-text'>{id}</p>}
            </div>
          </div>
        )}
        {type === 'join' && (
          <div className='c-home__choice-join'>
            <div className='c-text'>
              <label htmlFor='idGame' className='c-text__label'>
                Enter the game ID
              </label>
              <input
                id='idGame'
                type='enterId'
                placeholder='Enter the game ID'
                className='c-text__input'
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
      <Button type='submit' onClick={onSubmit} className='c-home__button'>
        Start
      </Button>
    </div>
  );
};

export default Home;
