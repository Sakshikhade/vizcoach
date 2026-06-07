import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from 'hooks';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FormField, VizCoachLogo } from 'components';
import {
  PersonAddOutlined,
  SchoolOutlined,
  CastForEducationOutlined,
  Google,
} from '@mui/icons-material';
import { UserRole } from 'db';

type SignupState = Partial<{
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}>;

export const Signup = () => {
  const { user, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [state, setState] = useState<SignupState>({});
  const [role, setRole] = useState<UserRole>('Student');
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

  const setField = (field: keyof SignupState, value?: string) => {
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

  const onSignup = () => {
    const { name, email, password, confirmPassword } = state;
    if (!name || !email || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    register(name, email, password, role, (err) => {
      if (err) {
        // Surface a friendly message from PocketBase validation errors
        const data = (err as any)?.data?.data;
        if (data?.email?.message) {
          setError(data.email.message);
        } else if (data?.password?.message) {
          setError(data.password.message);
        } else {
          setError(err.message || 'Registration failed. Please try again.');
        }
      }
      setLoading(false);
    });
  };

  const handleGoogleSignup = () => {
    setLoading(true);
    loginWithGoogle((error) => {
      setError(error?.message || '');
      setLoading(false);
    }, role);
  };

  const isFormValid =
    !!state.name &&
    !!state.email &&
    !!state.password &&
    !!state.confirmPassword;

  return (
    <Grid2
      alignContent="center"
      minHeight="100svh"
      sx={{
        background:
          'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #dbeafe 100%)',
        py: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '90%',
          maxWidth: '520px',
          marginX: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {/* Header accent bar */}
        <Box
          sx={{
            height: 4,
            background:
              'linear-gradient(90deg, #2563eb 0%, #60a5fa 50%, #1d4ed8 100%)',
          }}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSignup();
          }}
        >
          <Stack gap={3} padding={3.5}>
            {/* Logo + heading */}
            <Stack gap={0.5}>
              <VizCoachLogo />
              <Typography
                variant="h5"
                sx={{
                  fontFamily: '"Outfit", sans-serif',
                  fontWeight: 700,
                  color: 'text.primary',
                  mt: 1,
                }}
              >
                Create your account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Join VizCoach and start your data visualization journey.
              </Typography>
            </Stack>

            <Divider />

            {/* Role selector */}
            <Stack gap={1}>
              <Typography
                variant="body2"
                fontWeight={500}
                color="text.secondary"
              >
                I am joining as a…
              </Typography>
              <FormControl>
                <RadioGroup
                  row
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  sx={{ gap: 2 }}
                >
                  {(['Student', 'Teacher'] as UserRole[]).map((r) => (
                    <Box
                      key={r}
                      onClick={() => setRole(r)}
                      sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 2,
                        py: 1.5,
                        border: '2px solid',
                        borderColor: role === r ? 'primary.main' : 'divider',
                        borderRadius: 2,
                        bgcolor:
                          role === r ? 'primary.main' : 'background.paper',
                        color:
                          role === r ? 'primary.contrastText' : 'text.primary',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.light',
                          bgcolor: role === r ? 'primary.dark' : 'action.hover',
                        },
                      }}
                    >
                      {r === 'Student' ? (
                        <SchoolOutlined fontSize="small" />
                      ) : (
                        <CastForEducationOutlined fontSize="small" />
                      )}
                      <FormControlLabel
                        value={r}
                        control={<Radio sx={{ display: 'none' }} />}
                        label={
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ cursor: 'pointer' }}
                          >
                            {r}
                          </Typography>
                        }
                        sx={{ m: 0, flex: 1 }}
                      />
                    </Box>
                  ))}
                </RadioGroup>
              </FormControl>
            </Stack>

            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={<Google />}
              onClick={handleGoogleSignup}
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
              Sign up with Google
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
              OR SIGN UP WITH EMAIL
            </Alert>

            {/* Name field */}
            <FormField label="Full Name" required>
              <TextField
                variant="outlined"
                type="text"
                placeholder="e.g. Jane Doe"
                value={state.name || ''}
                onChange={(e) => setField('name', e.target.value)}
                disabled={loading}
                required
                autoComplete="name"
                size="small"
              />
            </FormField>

            {/* Email field */}
            <FormField label="Email Address" required>
              <TextField
                variant="outlined"
                type="email"
                placeholder="you@example.com"
                value={state.email || ''}
                onChange={(e) => setField('email', e.target.value)}
                disabled={loading}
                required
                autoComplete="email"
                size="small"
              />
            </FormField>

            {/* Password fields side-by-side */}
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
              <FormField label="Password" required>
                <TextField
                  variant="outlined"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={state.password || ''}
                  onChange={(e) => setField('password', e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="new-password"
                  size="small"
                />
              </FormField>
              <FormField label="Confirm Password" required>
                <TextField
                  variant="outlined"
                  type="password"
                  placeholder="Repeat password"
                  value={state.confirmPassword || ''}
                  onChange={(e) => setField('confirmPassword', e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="new-password"
                  size="small"
                />
              </FormField>
            </Stack>

            {/* Submit */}
            <Button
              variant="contained"
              type="submit"
              size="large"
              startIcon={
                loading ? (
                  <CircularProgress size="1.4rem" color="inherit" />
                ) : (
                  <PersonAddOutlined />
                )
              }
              disabled={!isFormValid || loading}
              sx={{ mt: 0.5 }}
            >
              {!loading && 'Create Account'}
            </Button>

            {/* Error alert */}
            {!!error.length && <Alert severity="error">{error}</Alert>}

            {/* Link to login */}
            <Typography
              variant="body2"
              textAlign="center"
              color="text.secondary"
            >
              Already have an account?{' '}
              <Typography
                component={Link}
                to="/login"
                variant="body2"
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Sign in
              </Typography>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </Grid2>
  );
};
