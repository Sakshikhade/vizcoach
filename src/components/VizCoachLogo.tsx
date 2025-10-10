import { SsidChart } from '@mui/icons-material';
import { Stack, Typography } from '@mui/material';

export const VizCoachLogo = () => {
  return (
    <Stack direction="row" alignItems="center">
      <SsidChart sx={{ mr: 1 }} />
      <Typography
        variant="h6"
        noWrap
        component="span"
        sx={{
          fontFamily: 'monospace',
          fontWeight: 600,
          letterSpacing: '.2rem',
          color: 'inherit',
          textDecoration: 'none',
        }}
      >
        VIZCOACH
      </Typography>
    </Stack>
  );
};
