import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from 'hooks';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import {
  Alert,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FormField, VizCoachLogo } from 'components';
import { LoginOutlined } from '@mui/icons-material';

type LoginState = Partial<{
  email: string;
  password: string;
}>;

export const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [state, setState] = useState<LoginState>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getReturnRoute = useCallback(
    (): string => search.replace('?return=', '') || '/dashboard',
    [search],
  );

  useEffect(() => {
    if (!!user) {
      navigate(getReturnRoute(), { replace: true });
    }
  }, [user, navigate, getReturnRoute]);

  const setField = (field: keyof LoginState, value?: string) => {
    if (value === state[field]) return;
    setError('');
    if (!value || !value.length) {
      setState((prev) => {
        delete prev[field];
        return { ...prev };
      });
      return;
    }
    setState((prev) => ({ ...prev, [field]: value }));
  };

  const onLogin = () => {
    setLoading(true);
    const { email, password } = state;
    if (!email || !password) {
      return;
    }
    login(email, password, (error) => {
      setError(error?.message || '');
      setLoading(false);
    });
  };

  return (
    <Grid2 alignContent="center" height="100svh">
      <Paper
        variant="outlined"
        sx={{ width: '90%', maxWidth: '500px', marginX: 'auto' }}
      >
        <form>
          <Stack gap={4} padding={2}>
            <VizCoachLogo />
            <FormField label="Email Address" required>
              <TextField
                variant="outlined"
                type="email"
                value={state.email || ''}
                onChange={(event) => setField('email', event.target.value)}
                disabled={loading}
                required
              />
            </FormField>
            <FormField label="Password" required>
              <TextField
                variant="outlined"
                type="password"
                value={state.password || ''}
                onChange={(event) => setField('password', event.target.value)}
                disabled={loading}
                required
              />
            </FormField>
            <Button
              variant="contained"
              type="submit"
              size="large"
              startIcon={
                loading ? <CircularProgress size="1.6rem" /> : <LoginOutlined />
              }
              onClick={onLogin}
              disabled={!state.email || !state.password || loading}
            >
              {!loading && <>Login</>}
            </Button>
            {!!error.length && <Alert severity="error">{error}</Alert>}
            <Typography
              variant="body2"
              textAlign="center"
              color="text.secondary"
            >
              Don't have an account?{' '}
              <Typography
                component={Link}
                to="/signup"
                variant="body2"
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Sign up
              </Typography>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </Grid2>
  );
};
