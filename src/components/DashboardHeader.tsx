import { ReactNode } from 'react';
import { Stack, Typography } from '@mui/material';

interface DashboardHeaderProps {
  heading: string;
  subtitle: string;
  filterComponent?: ReactNode;
}

export const DashboardHeader = ({
  heading,
  subtitle,
  filterComponent,
}: DashboardHeaderProps) => {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Stack>
        <Typography variant="h5">{heading}</Typography>
        <Typography variant="subtitle1">{subtitle}</Typography>
      </Stack>
      {filterComponent}
    </Stack>
  );
};
