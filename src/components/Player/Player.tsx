import { FC } from 'react';

import notAvatar from 'assets/not-avatar.jpg';

import { IPlayerProps } from 'interfaces';

const Player: FC<IPlayerProps> = ({ player }) => {
  return (
    <div className='c-player'>
      {player?.turn === 'circle' ? (
        <div className='c-player__type-1' />
      ) : (
        <div className='c-player__type-2'>
          <div className='c-player__type-2-inner' />
          <div className='c-player__type-2-inner' />
        </div>
      )}
      <div className='c-player__avatar'>
        <img src={player?.avatar || notAvatar} alt='Player' />
      </div>
      <p className='c-player__title'>{player?.name || 'Player'}</p>
      <p className='c-player__score'>{player?.countWinner}</p>
    </div>
  );
};

export default Player;
