import { CircularProgress, Stack } from '@mui/material';

export const Loading = () => {
  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      height="100svh"
    >
      <CircularProgress />
    </Stack>
  );
};
