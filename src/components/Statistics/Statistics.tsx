import { FC } from 'react';

import SwitchTransitionWrapper from 'components/SwitchTransitionWrapper';

import { IStatisticsProps } from 'interfaces';

const Statistics: FC<IStatisticsProps> = ({ lineWinner, typeTurn }) => {
  return (
    <div className='c-statistics'>
      <SwitchTransitionWrapper inProp={!!lineWinner}>
        <p className='c-statistics__title'>
          {lineWinner ? 'Winner' : 'Turn'}
          <span>&#10142;</span>
        </p>
      </SwitchTransitionWrapper>
      <SwitchTransitionWrapper
        inProp={(lineWinner && typeTurn === 'cross') || (!lineWinner && typeTurn === 'circle')}
      >
        {(lineWinner && typeTurn === 'cross') || (!lineWinner && typeTurn === 'circle') ? (
          <div className='c-player__type-1' />
        ) : (
          <div className='c-player__type-2'>
            <div className='c-player__type-2-inner' />
            <div className='c-player__type-2-inner' />
          </div>
        )}
      </SwitchTransitionWrapper>
    </div>
  );
};

export default Statistics;
