import { FC } from 'react';

import { userAuth } from 'service/firebaseAuth';

import Button from 'components/Button';

const Login: FC = () => {
  return (
    <Button className='c-button--login-google' onClick={userAuth}>
      Login with google
    </Button>
  );
};

export default Login;
