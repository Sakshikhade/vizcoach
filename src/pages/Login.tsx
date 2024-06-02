import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { useAuth } from 'hooks';

export const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!!user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const loginAsTestUser = async () => {
    const email = process.env.REACT_APP_TEST_EMAIL || '';
    const password = process.env.REACT_APP_TEST_PASSWORD || '';
    login(email, password, () => navigate('/dashboard'));
  };

  return (
    <>
      <Button onClick={loginAsTestUser}>Login as Test User</Button>
    </>
  );
};
