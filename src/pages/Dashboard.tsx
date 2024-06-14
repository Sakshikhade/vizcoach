import { Outlet, useNavigation } from 'react-router-dom';
import { Loading, NavigationBar } from 'components';

export const Dashboard = () => {
  const { state } = useNavigation();
  return (
    <>
      <NavigationBar />
      {state !== 'idle' ? <Loading /> : <Outlet />}
    </>
  );
};
