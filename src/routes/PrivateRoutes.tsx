import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from 'hooks';

export const PrivateRoutes = () => {
  const { user } = useAuth();
  const { pathname, search } = useLocation();
  return (
    <>
      {!user ? (
        <Navigate to={`login?return=${pathname}${search}`} />
      ) : (
        <Outlet />
      )}
    </>
  );
};
