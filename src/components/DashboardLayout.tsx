import { Stack } from '@mui/material';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  breadcrumbs: ReactNode;
  header: ReactNode;
  content: ReactNode;
  speedDial?: ReactNode;
}

export const DashboardLayout = ({
  breadcrumbs,
  header,
  content,
  speedDial,
}: DashboardLayoutProps) => {
  return (
    <Stack spacing={4} marginY={4}>
      {breadcrumbs}
      {header}
      {content}
      {speedDial}
    </Stack>
  );
};
