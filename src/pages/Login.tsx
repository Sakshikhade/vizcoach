import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { useAuth } from 'hooks';

export const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { search } = useLocation();

  const getReturnRoute = useCallback(
    (): string => search.replace('?return=', '') || '/dashboard',
    [search],
  );

  useEffect(() => {
    if (!!user) {
      navigate(getReturnRoute());
    }
  }, [user, navigate, getReturnRoute]);

  const loginAsTestUser = async () => {
    const email = process.env.REACT_APP_TEST_EMAIL || '';
    const password = process.env.REACT_APP_TEST_PASSWORD || '';
    login(email, password, () => navigate(getReturnRoute()));
  };

  return (
    <>
      <Button onClick={loginAsTestUser}>Login as Test User</Button>
    </>
  );
};
