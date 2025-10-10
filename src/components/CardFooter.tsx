import { PropsWithChildren } from 'react';
import { Stack } from '@mui/material';
import { ArrowForward, Lock } from '@mui/icons-material';

export type CardFooterProps = {
  locked?: boolean;
} & PropsWithChildren;

export const CardFooter = ({ locked, children }: CardFooterProps) => {
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
      {locked ? <Lock /> : <ArrowForward />}
    </Stack>
  );
};
