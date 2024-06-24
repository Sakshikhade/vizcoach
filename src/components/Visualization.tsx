import { Paper, Stack } from '@mui/material';
import { VegaLite, View, VisualizationSpec } from 'react-vega';
import { Dataset } from 'db';

type VisualizationProps = {
  datasets: Dataset[];
  json: string;
};

export const Visualization = ({ datasets, json }: VisualizationProps) => {
  const spec = (JSON.parse(json) as VisualizationSpec) || {};

  const onNewView = (view: View) => {
    const name: string | undefined = (spec.data as any).name;
    if (!name) return;
    datasets
      .filter((dataset, i) => new Set([dataset.name, `${i + 1}.csv`]).has(name))
      .forEach((dataset) => view.insert(name, dataset.rows));
    view.runAsync();
  };

  return (
    <Paper variant="outlined">
      <Stack height="30rem" width="100%">
        <VegaLite spec={spec} actions={false} onNewView={onNewView} />
      </Stack>
    </Paper>
  );
};
