import { Container, Stack } from '@mui/material';
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
    <Container>
      <Stack spacing={4} marginTop={12} marginBottom={4}>
        {breadcrumbs}
        {header}
        {content}
        {speedDial}
      </Stack>
    </Container>
  );
};
