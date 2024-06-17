import { ReactNode } from 'react';
import { Stack, Typography } from '@mui/material';

interface DashboardHeaderProps {
  heading: string;
  subtitle: string;
  options?: ReactNode;
}

export const DashboardHeader = ({
  heading,
  subtitle,
  options,
}: DashboardHeaderProps) => {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Stack>
        <Typography variant="h4">{heading}</Typography>
        <Typography variant="subtitle1">{subtitle}</Typography>
      </Stack>
      {options}
    </Stack>
  );
};
