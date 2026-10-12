import { FC } from 'react';
import { ProgressBar } from 'react-loader-spinner';
import { useLocation } from 'react-router-dom';

const Waiting: FC = () => {
  const { state } = useLocation();
  return (
    <div className='c-overlay c-overlay--waiting'>
      <div className='c-waiting '>
        <p className='c-waiting__title'>Waiting the second player</p>
        <ProgressBar
          height='100'
          width='100'
          ariaLabel='progress-bar-loading'
          borderColor='#bfdbfe'
          barColor='#bfdbfe'
        />
        <p className='c-waiting__text'>Want to add a second player? Copy and send the game ID:</p>
        <p className='c-waiting__text'>{state.id}</p>
      </div>
    </div>
  );
};

export default Waiting;
