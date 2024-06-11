import { PropsWithChildren } from 'react';
import { Stack } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

export type CardFooterProps = PropsWithChildren;

export const CardFooter = ({ children }: CardFooterProps) => {
  return (
    <Stack
      marginTop={2}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <Stack direction="row" spacing={1}>
        {children}
      </Stack>
      <ArrowForward />
    </Stack>
  );
};
