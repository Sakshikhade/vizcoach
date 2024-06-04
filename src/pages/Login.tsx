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

  const teacherLogin = async () => {
    const email = process.env.REACT_APP_TEACHER_EMAIL || '';
    const password = process.env.REACT_APP_TEACHER_PASSWORD || '';
    login(email, password, () => navigate(getReturnRoute()));
  };

  const studentLogin = async () => {
    const email = process.env.REACT_APP_STUDENT_EMAIL || '';
    const password = process.env.REACT_APP_STUDENT_PASSWORD || '';
    login(email, password, () => navigate(getReturnRoute()));
  };

  return (
    <>
      <Button variant="contained" onClick={teacherLogin}>
        Login as Teacher
      </Button>
      <Button variant="contained" onClick={studentLogin}>
        Login as Student
      </Button>
    </>
  );
};
