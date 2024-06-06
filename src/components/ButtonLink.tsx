import { useNavigate } from 'react-router-dom';
import { Link, LinkProps } from '@mui/material';

export const ButtonLink = (props: LinkProps) => {
  const { href, children } = props;
  const navigate = useNavigate();
  return (
    <Link
      component="button"
      underline="hover"
      onClick={() => navigate(href || '')}
      {...props}
    >
      {children}
    </Link>
  );
};
