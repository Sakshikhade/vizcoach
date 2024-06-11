import { PropsWithChildren } from 'react';
import { Typography } from '@mui/material';

export type CardEllipsisableBody = PropsWithChildren;

export const CardEllipsisableBody = ({ children }: CardEllipsisableBody) => {
  return (
    <Typography
      variant="subtitle2"
      sx={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: '3',
        WebkitBoxOrient: 'vertical',
      }}
    >
      {children}
    </Typography>
  );
};
