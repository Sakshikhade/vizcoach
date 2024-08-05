import { useMemo } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import { VisualizationSpec } from 'react-vega';
import { Dataset } from 'db';

const marks = ['bar', 'point', 'line'] as const;
type Mark = (typeof marks)[number];

type ChangableField = 'data.name' | 'mark.type';

type Spec = VisualizationSpec &
  Partial<{
    data: Partial<{
      name: string;
    }>;
    mark: Partial<{
      type: Mark;
      tooltip: boolean;
    }>;
  }>;

type VegaLiteBuilderProps = {
  json: string;
  datasets: Dataset[];
  readOnly?: boolean;
  onJsonChange?: (value: string) => void;
};

export const VegaLiteBuilder = ({
  json,
  datasets,
  readOnly,
  onJsonChange,
}: VegaLiteBuilderProps) => {
  const datasetMap = useMemo(
    () =>
      datasets.reduce((map, dataset) => {
        map.set(dataset.name, dataset);
        return map;
      }, new Map<string, Dataset>()),
    [datasets],
  );

  const datasetNames = useMemo(() => [...datasetMap.keys()], [datasetMap]);

  const configuration = useMemo(() => {
    const parsed: Spec = JSON.parse(json);

    // Converting number-based dataset to name
    const name = parsed.data?.name;
    if (name && !datasetMap.has(name)) {
      // Parse the index and replace it with the dataset's name
      const index = parseInt(name?.replace('.csv', '') || '1') - 1;
      parsed.data = { name: datasetNames[index] };
    } else if (!name) {
      // If no data is set then default it to the first dataset
      parsed.data = { name: datasetNames[0] };
    }

    // If no mark is set then default it to the first mark
    if (!parsed.mark?.type) {
      parsed.mark = { type: marks[0] };
    }

    return parsed;
  }, [json, datasetMap, datasetNames]);

  const onChange = (field: ChangableField, value?: string | number) => {
    if (!onJsonChange || !value) return;
    const parsed: Spec = JSON.parse(json);
    switch (field) {
      case 'data.name': {
        const data = { name: value };
        Object.assign(parsed, { data });
        break;
      }
      case 'mark.type': {
        const mark = { type: value, tooltip: true };
        Object.assign(parsed, { mark });
        break;
      }
      default:
        console.warn(`Unknown changable field: ${field}`);
    }
    onJsonChange(JSON.stringify(parsed, null, 4));
  };

  return (
    <Stack gap={4}>
      <FormControl disabled={readOnly} fullWidth>
        <InputLabel id="dataset-label">Dataset</InputLabel>
        <Select
          labelId="dataset-label"
          label="Dataset"
          value={configuration.data?.name}
          onChange={(event) => onChange('data.name', event.target.value)}
        >
          {datasets.map((dataset, i) => (
            <MenuItem key={dataset.name} value={dataset.name}>
              {dataset.name} ({i + 1}.csv)
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl disabled={readOnly} fullWidth>
        <InputLabel id="mark-label">Mark</InputLabel>
        <Select
          labelId="mark-label"
          label="Mark"
          value={configuration.mark?.type}
          onChange={(event) => onChange('mark.type', event.target.value)}
        >
          {marks.map((mark) => (
            <MenuItem key={mark} value={mark}>
              {`${mark[0].toUpperCase()}${mark.slice(1)}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
};
