import { Paper, Stack } from '@mui/material';
import { PlainObject, VegaLite, VisualizationSpec } from 'react-vega';
import { Handler } from 'vega-tooltip';
import { Dataset, Submission } from 'db';

type VisualizationProps = {
  datasets: Dataset[];
  submission: Submission | null;
};

export const Visualization = ({ datasets, submission }: VisualizationProps) => {
  const spec = (submission?.json as VisualizationSpec) || {};
  const data = datasets.reduce(
    (obj, dataset) => Object.assign(obj, { [dataset.name]: dataset.rows }),
    {} as PlainObject,
  );
  return (
    <Paper variant="outlined">
      <Stack height="30rem" width="100%">
        <VegaLite
          spec={spec}
          data={data}
          actions={false}
          tooltip={new Handler().call}
        />
      </Stack>
    </Paper>
  );
};
