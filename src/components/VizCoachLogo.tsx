import { SsidChart } from '@mui/icons-material';
import { Stack, Typography } from '@mui/material';

export const VizCoachLogo = () => {
  return (
    <Stack direction="row" alignItems="center">
      <SsidChart sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
      <Typography
        variant="h6"
        noWrap
        component="span"
        sx={{
          fontFamily: '"Outfit", sans-serif',
          fontWeight: 800,
          letterSpacing: '.1rem',
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textDecoration: 'none',
        }}
      >
        VIZCOACH
      </Typography>
    </Stack>
  );
};
