import { FC } from 'react';
import { Oval } from 'react-loader-spinner';

const Spinner: FC = () => {
  return (
    <div className='c-overlay'>
      <Oval
        strokeWidth={4}
        strokeWidthSecondary={4}
        height={100}
        width={100}
        color='#bfdbfe'
        ariaLabel='oval-loading'
        secondaryColor='#bfdbfe'
      />
    </div>
  );
};

export default Spinner;
