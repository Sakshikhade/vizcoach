import { VegaLite, View, VisualizationSpec } from 'react-vega';
import { Typography } from '@mui/material';
import { Dataset } from 'db';

type VisualizationProps = {
  datasets: Dataset[];
  json: string;
};

export const Visualization = ({ datasets, json }: VisualizationProps) => {
  let spec: VisualizationSpec = {};
  try {
    spec = (JSON.parse(json) as VisualizationSpec) || {};
  } catch {
    return (
      <Typography color="text.secondary" sx={{ p: 2 }}>
        Invalid JSON — unable to render visualization.
      </Typography>
    );
  }

  // Resolve numbered dataset name (e.g. "1.csv") to actual dataset filename,
  // mirroring the same logic in VegaLiteBuilder so data injection works.
  const specData = (spec as any).data;
  if (specData?.name && datasets.length) {
    const numericIndex = parseInt(specData.name.replace('.csv', ''), 10) - 1;
    if (!isNaN(numericIndex) && datasets[numericIndex]) {
      (spec as any).data = { name: datasets[numericIndex].name };
    }
  }

  const onNewView = (view: View) => {
    const name: string | undefined = (spec as any).data?.name;
    if (!name) return;
    datasets
      .filter((dataset, i) => new Set([dataset.name, `${i + 1}.csv`]).has(name))
      .forEach((dataset) => view.insert(name, dataset.rows));
    view.runAsync();
  };

  return <VegaLite spec={spec} actions={false} onNewView={onNewView} />;
};
