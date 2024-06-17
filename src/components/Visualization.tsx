import { Paper } from '@mui/material';

type VisualizationProps = {
  json?: object;
};

export const Visualization = ({ json }: VisualizationProps) => {
  return (
    <Paper variant="outlined" sx={{ height: '30rem' }}>
      {JSON.stringify(json) || 'No JSON'}
    </Paper>
  );
};
