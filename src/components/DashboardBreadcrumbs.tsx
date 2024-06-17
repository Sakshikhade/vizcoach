import { Home, NavigateNext } from '@mui/icons-material';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { ButtonLink } from 'components';

interface ButtonLinkObject {
  href: string;
  children: string;
}

interface DashboardBreadcrumbsProps {
  title: string;
  links?: ButtonLinkObject[];
}

export const DashboardBreadcrumbs = ({
  title,
  links,
}: DashboardBreadcrumbsProps) => {
  return (
    <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
      <Link
        underline="none"
        color="inherit"
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <Home fontSize="inherit" />
      </Link>
      {(links || []).map(({ href, children }) => {
        return (
          <ButtonLink key={children} color="inherit" href={href}>
            {children}
          </ButtonLink>
        );
      })}
      <Typography color="text.primary">{title}</Typography>
    </Breadcrumbs>
  );
};
