import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';
import { NavigationBar } from 'components';

export const Dashboard = () => {
  return (
    <>
      <NavigationBar />
      <Container>
        <Outlet />
      </Container>
    </>
  );
};
