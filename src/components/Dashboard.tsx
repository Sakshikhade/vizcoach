import { createContext, PropsWithChildren, ReactNode } from 'react';
import { Outlet, useLoaderData, useNavigation } from 'react-router-dom';
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
import { ButtonLink, Loading, NavigationBar } from 'components';
import { User } from 'db';
import { useAuth } from 'hooks';

type DashboardContextValue = Partial<{
  user: User | null;
  useData: <T>() => T;
}>;

export const DashboardContext = createContext<DashboardContextValue>({});

export const Dashboard = () => {
  const { state } = useNavigation();
  const { user } = useAuth();
  return (
    <DashboardContext.Provider
      value={{
        user,
        useData: <T,>() => useLoaderData() as T,
      }}
    >
      <NavigationBar />
      {state !== 'idle' ? (
        <Loading />
      ) : (
        <Container>
          <Stack spacing={4} marginTop={12} marginBottom={4}>
            <Outlet />
          </Stack>
        </Container>
      )}
    </DashboardContext.Provider>
  );
};

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
  onClick?: () => void;
  open?: boolean;
  staticIcon?: boolean;
} & PropsWithChildren;

const DashboardSpeedDial = ({
  label,
  icon,
  children,
  onClick,
  open,
  staticIcon,
}: DashboardSpeedDialProps) => (
  <SpeedDial
    ariaLabel={label}
    sx={{ position: 'fixed', bottom: '2rem', right: '2rem' }}
    icon={
      staticIcon ? (
        <SpeedDialIcon icon={icon} openIcon={icon} />
      ) : (
        <SpeedDialIcon openIcon={icon} />
      )
    }
    FabProps={{ onClick }}
    open={open}
  >
    {children}
  </SpeedDial>
);

DashboardBreadcrumbs.Link = BreadcrumbsLink;
Dashboard.Breadcrumbs = DashboardBreadcrumbs;
Dashboard.Header = DashboardHeader;
Dashboard.SpeedDial = DashboardSpeedDial;
