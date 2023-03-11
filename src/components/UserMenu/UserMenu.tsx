import { FC, MouseEvent } from 'react';
import { useLocation } from 'react-router-dom';

import useKeyDown from 'hooks/useKeyDown';
import useUser from 'hooks/useUser';

const UserMenu: FC<{
  logOutHandler: () => void;
  goHomeHandler: () => void;
  menuHundler: () => void;
}> = ({ logOutHandler, goHomeHandler, menuHundler }) => {
  const { state } = useLocation();
  const { displayName } = useUser();

  useKeyDown(menuHundler);

  const onClickOutsideMenu = (e: MouseEvent<HTMLDivElement>) => {
    if (e.currentTarget === e.target) {
      menuHundler();
    }
  };

  return (
    <>
      <div className='c-select__dropdown'>
        <div className='c-select__dropdown-inner'>
          <ul className='c-select__list'>
            <li className='c-select__item'>{state?.id}</li>
            <li className='c-select__item'>{displayName}</li>
            <li className='c-select__item'>
              <button type='button' onClick={() => goHomeHandler()}>
                Home
              </button>
            </li>
            <li className='c-select__item'>
              <button type='button' onClick={() => logOutHandler()}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className='c-overlay c-overlay--menu' onClick={onClickOutsideMenu} />
    </>
  );
};

export default UserMenu;
