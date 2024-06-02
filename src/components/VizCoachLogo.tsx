import { SsidChart } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

export const VizCoachLogo = () => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
    </Box>
  );
};
