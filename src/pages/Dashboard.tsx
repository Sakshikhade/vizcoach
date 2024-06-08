import { Outlet } from 'react-router-dom';
import { NavigationBar } from 'components';

export const Dashboard = () => {
  return (
    <>
      <NavigationBar />
      <Outlet />
    </>
  );
};
