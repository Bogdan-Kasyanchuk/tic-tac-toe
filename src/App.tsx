import { useConvexAuth } from 'convex/react';
import type { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import AppLayout from '@/components/AppLayout';
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
        <>
            <Toaster />
            { isLoading
                ? <Spinner />
                : (
                    <Routes>
                        <Route
                            path="/login"
                            element={ <PublicRoute restricted><LoginPage /></PublicRoute> }
                        />
                        <Route element={ <PrivateRoute><AppLayout /></PrivateRoute> }>
                            <Route
                                path="/"
                                element={ <HomePage /> }
                            />
                            <Route
                                path="/game/:gameId"
                                element={ <GamePage /> }
                            />
                        </Route>
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
                ) }
        </>
    );
};

export default App;
