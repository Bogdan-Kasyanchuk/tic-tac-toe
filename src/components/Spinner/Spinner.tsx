import type { FC } from 'react';
import { Oval } from 'react-loader-spinner';

import Overlay from '@/components/Overlay';

const Spinner: FC = () => (
    <Overlay>
        <Oval
            height={ 100 }
            width={ 100 }
            color="#bfdbfe"
            secondaryColor="#bfdbfe"
            strokeWidth={ 4 }
            strokeWidthSecondary={ 4 }
            ariaLabel="oval-loading"
        />
    </Overlay>
);

export default Spinner;
