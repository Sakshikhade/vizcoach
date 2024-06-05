import { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from 'hooks';
import { UserRole } from 'db';

interface AuthorizedRouteProps extends PropsWithChildren {
  navigateTo: string;
  allowedRoles: UserRole[];
}

export const AuthorizedRoute = ({
  navigateTo,
  allowedRoles,
  children,
}: AuthorizedRouteProps) => {
  const { user } = useAuth();
  return (
    <>
      {user === null || !allowedRoles.includes(user.role) ? (
        <Navigate to={navigateTo} replace={true} />
      ) : (
        children
      )}
    </>
  );
};
