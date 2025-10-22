import { VegaLite, View, VisualizationSpec } from 'react-vega';
import { Dataset } from 'db';

type VisualizationProps = {
  datasets: Dataset[];
  json: string;
};

export const Visualization = ({ datasets, json }: VisualizationProps) => {
  let spec: VisualizationSpec | any = {};
  try {
    let parsed: any = json;
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
      } catch {}
    }
    if (Array.isArray(parsed)) {
      let first: any = parsed[0]?.json ?? parsed[0] ?? {};
      if (typeof first === 'string') {
        try {
          first = JSON.parse(first);
        } catch {}
      }
      spec = first;
    } else if (
      parsed &&
      typeof parsed === 'object' &&
      typeof (parsed as any).json !== 'undefined'
    ) {
      let inner: any = (parsed as any).json;
      if (typeof inner === 'string') {
        try {
          inner = JSON.parse(inner);
        } catch {}
      }
      spec = inner;
    } else {
      spec = parsed || {};
    }
  } catch {
    spec = {};
  }

  // Ensure the visualization fits its container if not specified
  if (spec && typeof spec === 'object') {
    if (!('autosize' in spec)) {
      (spec as any).autosize = { type: 'fit', contains: 'padding' };
    }
    if (!('width' in spec)) {
      (spec as any).width = 'container';
    }
    // Provide a reasonable default height if not specified
    if (!('height' in spec)) {
      (spec as any).height = 240;
    }
  }

  const onNewView = (view: View) => {
    const name: string | undefined = (spec.data as any).name;
    if (!name) return;
    datasets
      .filter((dataset, i) => new Set([dataset.name, `${i + 1}.csv`]).has(name))
      .forEach((dataset) => view.insert(name, dataset.rows));
    view.runAsync();
  };

  return <VegaLite spec={spec} actions={false} onNewView={onNewView} />;
};
