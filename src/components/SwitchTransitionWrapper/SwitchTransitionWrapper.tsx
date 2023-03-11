import { FC, useRef } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';

import { ISwitchTransitionWrapperProps } from 'interfaces';

const SwitchTransitionWrapper: FC<ISwitchTransitionWrapperProps> = ({ inProp, children }) => {
  const firstRef = useRef<any>(null);
  const secondRef = useRef<any>(null);

  const nodeRef = inProp ? firstRef : secondRef;

  return (
    <SwitchTransition>
      <CSSTransition
        mountOnEnter
        unmountOnExit
        key={inProp ? 'first' : 'second'}
        nodeRef={nodeRef}
        addEndListener={(done: any) => {
          nodeRef?.current.addEventListener('transitionend', done, false);
        }}
        classNames='u-fade'
      >
        <div ref={nodeRef}>{children}</div>
      </CSSTransition>
    </SwitchTransition>
  );
};

export default SwitchTransitionWrapper;
