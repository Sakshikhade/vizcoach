import { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'hooks';

type AuthenticatedRouteProps = PropsWithChildren;

export const AuthenticatedRoute = ({ children }: AuthenticatedRouteProps) => {
  const { user } = useAuth();
  const { pathname, search } = useLocation();
  return (
    <>
      {user === null ? (
        <Navigate to={`/login?return=${pathname}${search}`} replace={true} />
      ) : (
        children
      )}
    </>
  );
};
