import { useConvexAuth } from 'convex/react';
import type { FC, ReactElement } from 'react';
import { Navigate } from 'react-router';

type PublicRouteProps = {
    children: ReactElement,
    restricted?: boolean
};

const PublicRoute: FC<PublicRouteProps> = ({ children, restricted = false }) => {
    const { isAuthenticated } = useConvexAuth();

    if (isAuthenticated && restricted) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return children;
};

export default PublicRoute;
