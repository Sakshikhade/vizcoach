import { PropsWithChildren, ReactNode } from 'react';
import {
  Breadcrumbs,
  Container,
  Link,
  SpeedDial,
  SpeedDialIcon,
  Stack,
  Typography,
} from '@mui/material';
import { Home, NavigateNext } from '@mui/icons-material';
import { ButtonLink } from 'components';

export const DashboardLayout = ({ children }: PropsWithChildren) => (
  <Container>
    <Stack spacing={4} marginTop={12} marginBottom={4}>
      {children}
    </Stack>
  </Container>
);

type DashboardBreadcrumbsProps = {
  title: string;
} & PropsWithChildren;

const DashboardBreadcrumbs = ({
  title,
  children,
}: DashboardBreadcrumbsProps) => (
  <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
    <Link
      underline="none"
      color="inherit"
      sx={{ display: 'flex', alignItems: 'center' }}
    >
      <Home fontSize="inherit" />
    </Link>
    {children}
    <Typography color="text.primary">{title}</Typography>
  </Breadcrumbs>
);

type BreadcrumbsLinkProps = {
  href: string;
} & PropsWithChildren;

const BreadcrumbsLink = ({ href, children }: BreadcrumbsLinkProps) => (
  <ButtonLink color="inherit" href={href}>
    {children}
  </ButtonLink>
);

type DashboardHeaderProps = {
  heading: string;
  subtitle: string;
} & PropsWithChildren;

const DashboardHeader = ({
  heading,
  subtitle,
  children,
}: DashboardHeaderProps) => {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Stack>
        <Typography variant="h4">{heading}</Typography>
        <Typography variant="subtitle1">{subtitle}</Typography>
      </Stack>
      {children}
    </Stack>
  );
};

type DashboardSpeedDialProps = {
  label: string;
  icon: ReactNode;
} & PropsWithChildren;

const DashboardSpeedDial = ({
  label,
  icon,
  children,
}: DashboardSpeedDialProps) => (
  <SpeedDial
    ariaLabel={label}
    sx={{ position: 'fixed', bottom: '2rem', right: '2rem' }}
    icon={<SpeedDialIcon openIcon={icon} />}
  >
    {children}
  </SpeedDial>
);

DashboardBreadcrumbs.Link = BreadcrumbsLink;
DashboardLayout.Breadcrumbs = DashboardBreadcrumbs;
DashboardLayout.Header = DashboardHeader;
DashboardLayout.SpeedDial = DashboardSpeedDial;
