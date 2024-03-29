import { FC } from 'react';
import { Toaster } from 'react-hot-toast';
import { Navigate, Route, Routes } from 'react-router-dom';

import useUser from 'hooks/useUser';

import bg from 'assets/bg.jpg';

import PrivateRoute from 'routes/PrivateRoute';
import PublicRoute from 'routes/PublicRoute';

import GamePage from 'pages/GamePage';
import HomePage from 'pages/HomePage';
import LoginPage from 'pages/LoginPage';

import Container from 'components/Container';
import NavBar from 'components/NavBar';
import Spinner from 'components/Spinner';

const App: FC = () => {
  const { loading } = useUser();

  return (
    <div className='app-bg'>
      <img className='app-bg__image' src={bg} alt='Фон' />
      <Toaster position='top-right' />
      {loading ? (
        <Spinner />
      ) : (
        <>
          <NavBar />
          <Container>
            <Routes>
              <Route
                path='/'
                element={
                  <PublicRoute>
                    <HomePage />
                  </PublicRoute>
                }
              />
              <Route
                path='/login'
                element={
                  <PublicRoute restricted>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path='/game/:gameId'
                element={
                  <PrivateRoute>
                    <GamePage />
                  </PrivateRoute>
                }
              />
              <Route path='/*' element={<Navigate to='/' />} />
            </Routes>
          </Container>
        </>
      )}
    </div>
  );
};

export default App;
