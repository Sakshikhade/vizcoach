import { NavigationBar } from 'components';
import { useAuth } from 'hooks';

export const Dashboard = () => {
  const user = useAuth();
  return (
    <>
      <NavigationBar />
    </>
  );
};

export default Dashboard;
