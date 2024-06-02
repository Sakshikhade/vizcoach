import { useAuth } from 'hooks';
import { Navigate, Outlet } from 'react-router-dom';

export const PrivateRoutes = () => {
  const { user } = useAuth();
  return <>{user ? <Outlet /> : <Navigate to="/login" />}</>;
};
