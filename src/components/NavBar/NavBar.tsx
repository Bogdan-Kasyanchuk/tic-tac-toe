import { FC, useState } from 'react';
import { Link, useLocation, useMatch, useNavigate } from 'react-router-dom';

import { checkGame, deleteGame, updateGame } from 'service/firebaseOperations';

import useUser from 'hooks/useUser';

import generateFields from 'helpers/generateFields';

import Button from 'components/Button';
import Modal from 'components/Modal';
import UserMenu from 'components/UserMenu';

const NavBar: FC = () => {
  const { state } = useLocation();
  const { user, auth, displayName } = useUser();
  const matchLogin = useMatch('/login');
  const matchGames = useMatch('/game/:gameId');
  const navigate = useNavigate();
  const [isMenu, setIsMenu] = useState<boolean>(false);
  const [isModal, setIsModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'logOut' | 'goHome'>('logOut');

  const deleteOrUpdateGame = async () => {
    if (matchGames && state.type === 'new') {
      deleteGame(state.id);
    } else {
      let checkUser;

      await checkGame(state.id).then((docSnap) => {
        checkUser = displayName === docSnap?.data()?.users.circle.name ? 'circle' : 'cross';
      });

      updateGame(state.id, {
        'users.quantityUsers': 1,
        [`users.${checkUser}.name`]: '',
        [`users.${checkUser}.avatar`]: '',
        [`users.${checkUser}.turn`]: '',
        fields: generateFields(),
        'users.circle.countWinner': 0,
        'users.cross.countWinner': 0,
        typeTurn: 'circle',
        idWinner: [],
        lineWinner: '',
      });
    }
  };

  const onLogOut = () => {
    deleteOrUpdateGame();
    setIsModal(false);
    auth.signOut();
  };

  const onGoHome = () => {
    deleteOrUpdateGame();
    setIsModal(false);
    navigate(`/`);
  };

  return (
    <div>
      <header className='c-header'>
        <Link to='/'>
          <h1 className='c-header__title'>Tic-Tac-Toe</h1>
        </Link>
        <div className='c-header__menu'>
          {user ? (
            matchGames ? (
              <div className='c-select'>
                <Button className='c-header__button' onClick={() => setIsMenu(!isMenu)}>
                  Menu
                </Button>
                {isMenu && (
                  <UserMenu
                    logOutHandler={() => {
                      setModalType('logOut');
                      setIsModal(true);
                      setIsMenu(false);
                    }}
                    goHomeHandler={() => {
                      setModalType('goHome');
                      setIsModal(true);
                      setIsMenu(false);
                    }}
                    menuHundler={() => {
                      setIsMenu(false);
                    }}
                  />
                )}
              </div>
            ) : (
              <Button className='c-header__button' onClick={() => setIsModal(true)}>
                Logout
              </Button>
            )
          ) : matchLogin ? (
            <Link to='/'>
              <Button className='c-header__button'>Home</Button>
            </Link>
          ) : (
            <Link to='/login'>
              <Button className='c-header__button'>Login</Button>
            </Link>
          )}
        </div>
      </header>
      {isModal && (
        <Modal
          modalHundler={() => setIsModal(false)}
          onOk={modalType === 'logOut' ? onLogOut : onGoHome}
        >
          {modalType === 'logOut'
            ? 'Are you sure what you want to go out? '
            : 'Are you sure you want to go to the home page? '}
          The current game will be ended!
        </Modal>
      )}
    </div>
  );
};

export default NavBar;
