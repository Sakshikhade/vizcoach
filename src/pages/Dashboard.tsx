import { Container } from '@mui/material';
import { NavigationBar } from 'components';
import { Groups } from '.';

export const Dashboard = () => {
  return (
    <>
      <NavigationBar />
      <Container>
        <Groups />
      </Container>
    </>
  );
};
