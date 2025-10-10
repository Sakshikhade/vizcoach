import { PropsWithChildren } from 'react';
import { FormControl, Stack, Typography } from '@mui/material';

type FormFieldProps = {
  label: string;
  required?: boolean;
  error?: string;
} & PropsWithChildren;

export const FormField = ({
  children,
  error,
  label,
  required,
}: FormFieldProps) => {
  return (
    <FormControl>
      <Stack direction="row" justifyContent="space-between">
        <Typography>{label}</Typography>
        {required && <Typography color="error">* required</Typography>}
      </Stack>
      {children}
      <Typography color="error">{error}</Typography>
    </FormControl>
  );
};
