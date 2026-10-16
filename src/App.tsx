import { useConvexAuth } from 'convex/react';
import type { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import bg from '@/assets/bg.jpg';
import Container from '@/components/Container';
import NavBar from '@/components/NavBar';
import Spinner from '@/components/Spinner';
import { Toaster } from '@/components/ui/sonner';
import GamePage from '@/pages/GamePage';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import PrivateRoute from '@/routes/PrivateRoute';
import PublicRoute from '@/routes/PublicRoute';

const App: FC = () => {
    const { isLoading } = useConvexAuth();

    return (
        <div className="relative mx-auto flex h-full min-h-screen max-w-480 flex-col bg-linear-to-r/srgb from-stone-300">
            <img
                src={ bg }
                alt="Фон"
                className="absolute -z-1 h-full w-full object-cover"
            />
            <Toaster />
            { isLoading
                ? <Spinner />
                : (
                    <>
                        <NavBar />
                        <Container>
                            <Routes>
                                <Route
                                    path="/"
                                    element={ <PublicRoute><HomePage /></PublicRoute> }
                                />
                                <Route
                                    path="/login"
                                    element={ <PublicRoute restricted><LoginPage /></PublicRoute> }
                                />
                                <Route
                                    path="/game/:gameId"
                                    element={ <PrivateRoute><GamePage /></PrivateRoute> }
                                />
                                <Route
                                    path="*"
                                    element={
                                        <Navigate
                                            to="/"
                                            replace
                                        />
                                    }
                                />
                            </Routes>
                        </Container>
                    </>
                ) }
        </div>
    );
};

export default App;
