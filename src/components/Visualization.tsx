import { Paper } from '@mui/material';
import { PlainObject, VegaLite, VisualizationSpec } from 'react-vega';

const spec: VisualizationSpec = {
  width: 400,
  height: 200,
  mark: 'bar',
  encoding: {
    x: { field: 'a', type: 'ordinal' },
    y: { field: 'b', type: 'quantitative' },
  },
  data: { name: 'table' },
};

const barData: PlainObject = {
  table: [
    { a: 'A', b: 28 },
    { a: 'B', b: 55 },
    { a: 'C', b: 43 },
    { a: 'D', b: 91 },
    { a: 'E', b: 81 },
    { a: 'F', b: 53 },
    { a: 'G', b: 19 },
    { a: 'H', b: 87 },
    { a: 'I', b: 52 },
  ],
};

type VisualizationProps = {
  json?: object;
};

export const Visualization = ({ json }: VisualizationProps) => {
  return (
    <Paper variant="outlined" sx={{ height: '30rem' }}>
      <VegaLite spec={spec} data={barData} />
    </Paper>
  );
};
