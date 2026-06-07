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
import { LoginOutlined, Google } from '@mui/icons-material';

type LoginState = Partial<{
  email: string;
  password: string;
}>;

export const Login = () => {
  const { user, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [state, setState] = useState<LoginState>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

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

  const handleGoogleLogin = () => {
    setLoading(true);
    loginWithGoogle((error) => {
      setError(error?.message || '');
      setLoading(false);
    });
  };

  const handlePasswordReset = async () => {
    if (!state.email) {
      setError('Please enter your email address to reset your password.');
      return;
    }
    setLoading(true);
    try {
      // Trigger native PocketBase password reset email logic
      const { default: client } = await import('db');
      await client.requestPasswordReset(state.email);
      setResetSuccess('Password reset email sent! Check your inbox.');
      setError('');
    } catch (err: any) {
      setError(err?.response?.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid2 alignContent="center" height="100svh">
      <Paper
        variant="outlined"
        sx={{ width: '90%', maxWidth: '500px', marginX: 'auto' }}
      >
        <form>
          <Stack gap={3} padding={2}>
            <VizCoachLogo />

            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={<Google />}
              onClick={handleGoogleLogin}
              disabled={loading}
              sx={{
                py: 1.5,
                mt: 1,
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50',
                },
              }}
            >
              Continue with Google
            </Button>

            <Alert
              severity="info"
              variant="outlined"
              sx={{
                py: 0,
                '& .MuiAlert-message': {
                  mx: 'auto',
                  textAlign: 'center',
                  width: '100%',
                  py: 1,
                },
                border: 'none',
                color: 'text.secondary',
                '& .MuiAlert-icon': { display: 'none' },
              }}
            >
              OR LOG IN WITH EMAIL
            </Alert>

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

            <Typography
              variant="body2"
              sx={{
                textAlign: 'right',
                mt: -2,
                color: 'primary.main',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}
              onClick={handlePasswordReset}
            >
              Forgot your password?
            </Typography>
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
            {!!resetSuccess.length && (
              <Alert severity="success">{resetSuccess}</Alert>
            )}
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
