import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from 'hooks';

interface TeacherRoutesProps {
  navigateTo: string;
}

export const TeacherRoutes = ({ navigateTo }: TeacherRoutesProps) => {
  const { user } = useAuth();
  return (
    <>
      {!user || user?.role !== 'Teacher' ? (
        <Navigate to={navigateTo} />
      ) : (
        <Outlet />
      )}
    </>
  );
};
