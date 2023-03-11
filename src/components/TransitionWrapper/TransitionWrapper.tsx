import { FC } from 'react';
import { Transition } from 'react-transition-group';

import { ITransitionWrapperProps } from 'interfaces';

const TransitionWrapper: FC<ITransitionWrapperProps> = ({ inProp, children }) => {
  return (
    <Transition in={inProp} timeout={150} mountOnEnter unmountOnExit>
      {children}
    </Transition>
  );
};

export default TransitionWrapper;
