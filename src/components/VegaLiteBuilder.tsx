import { useMemo } from 'react';
import { VisualizationSpec } from 'react-vega';
import {
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { Dataset } from 'db';

const marks = ['bar', 'point', 'line'] as const;
type Mark = (typeof marks)[number];

const encodings = ['x', 'y', 'color', 'opacity', 'size'] as const;
type Encoding = (typeof encodings)[number];

const encodingTypes = [
  'quantitative',
  'ordinal',
  'nominal',
  'temporal',
] as const;
type EncodingType = (typeof encodingTypes)[number];

type Spec = VisualizationSpec &
  Partial<{
    data: Partial<{
      name: string;
    }>;
    mark: Partial<{
      type: Mark;
      tooltip: boolean;
    }>;
    encoding: Partial<{
      [key in Encoding]: Partial<{
        field: string;
        type: EncodingType;
      }>;
    }>;
  }>;

type ChangableField =
  | 'data.name'
  | 'mark.type'

  // Add Encoding to Spec
  | 'encoding.+x'
  | 'encoding.+y'
  | 'encoding.+color'
  | 'encoding.+opacity'
  | 'encoding.+size'

  // Update Encoding
  | 'encoding.x'
  | 'encoding.y'
  | 'encoding.color'
  | 'encoding.opacity'
  | 'encoding.size'

  // Remove Encoding from Spec
  | 'encoding.-x'
  | 'encoding.-y'
  | 'encoding.-color'
  | 'encoding.-opacity'
  | 'encoding.-size'

  // Update Encoding field
  | 'encoding.x.field'
  | 'encoding.y.field'
  | 'encoding.color.field'
  | 'encoding.opacity.field'
  | 'encoding.size.field';

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

  const spec = useMemo(() => {
    const parsed: Spec = JSON.parse(json);

    // Converting number-based dataset to name
    const name = parsed.data?.name;
    if (name && !datasetMap.has(name)) {
      // Parse the index and replace it with the dataset's name
      const index = parseInt(name?.replace('.csv', '') || '1') - 1;
      parsed.data = { name: datasetNames[index] };
    }

    return parsed;
  }, [json, datasetMap, datasetNames]);

  const onChange = (field: ChangableField, value?: string) => {
    if (!onJsonChange) return;
    onJsonChange(applyChanges(json, field, value));
  };

  const addEncoding = () => {
    const exhaustedEncodings = new Set(Object.keys(spec.encoding || {}));
    const availableEncoding = encodings.find(
      (encoding) => !exhaustedEncodings.has(encoding),
    );
    if (!availableEncoding) {
      return;
    }
    onChange(`encoding.+${availableEncoding}`, availableEncoding);
  };

  return (
    <Stack gap={4}>
      <FormControl disabled={readOnly} fullWidth>
        <InputLabel id="dataset-label">Dataset</InputLabel>
        <Select
          labelId="dataset-label"
          label="Dataset"
          value={spec.data?.name}
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
          value={spec.mark?.type || ''}
          onChange={(event) => onChange('mark.type', event.target.value)}
        >
          {marks.map((mark) => (
            <MenuItem key={mark} value={mark}>
              {`${mark[0].toUpperCase()}${mark.slice(1)}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {Object.keys(spec.encoding || {}).map((encoding) => (
        <EncodingBuilder
          key={encoding}
          datasets={datasets}
          encoding={encoding as Encoding}
          spec={spec}
          onChange={onChange}
          readOnly={readOnly}
        />
      ))}
      <Button
        startIcon={<Add />}
        onClick={addEncoding}
        disabled={Object.keys(spec.encoding || {}).length >= encodings.length}
      >
        Add Encoding
      </Button>
    </Stack>
  );
};

type EncodingBuilderProps = {
  datasets: Dataset[];
  encoding: Encoding;
  spec: Spec;
  onChange: (field: ChangableField, value?: string) => void;
  readOnly?: boolean;
};

const EncodingBuilder = ({
  datasets,
  encoding,
  spec,
  onChange,
  readOnly,
}: EncodingBuilderProps) => {
  const exhaustedEncodings = useMemo(
    () => new Set(Object.keys(spec.encoding || {})),
    [spec],
  );

  const fields = useMemo(() => {
    const name = spec.data?.name;
    if (!name) {
      return [];
    }
    return (
      datasets.find((dataset, i) => {
        const index = parseInt(name.replace('.csv', ''), 10) - 1;
        return dataset.name === name || index === i;
      })?.fields || []
    );
  }, [spec, datasets]);

  const encodingSpec = useMemo(
    () => (spec?.encoding || {})[encoding] || {},
    [spec, encoding],
  );

  return (
    <>
      <Stack direction="row" gap={2} flex="auto 1">
        <FormControl disabled={readOnly} fullWidth>
          <InputLabel id={`${encoding}-encoding-label`}>
            {capitalize(encoding)} Encoding
          </InputLabel>
          <Select
            labelId={`${encoding}-encoding-label`}
            label={`${capitalize(encoding)} Encoding`}
            value={encoding}
            onChange={(event) =>
              onChange(`encoding.${encoding}`, event.target.value)
            }
          >
            {encodings.map((availableEncoding) => (
              <MenuItem
                key={availableEncoding}
                value={availableEncoding}
                disabled={exhaustedEncodings.has(availableEncoding)}
              >
                {capitalize(availableEncoding)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <IconButton
          sx={{ width: 0.1 }}
          onClick={() => onChange(`encoding.-${encoding}`)}
        >
          <Delete />
        </IconButton>
      </Stack>
      <FormControl disabled={readOnly} fullWidth>
        <InputLabel id={`${encoding}-encoding-field-label`}>
          {capitalize(encoding)} Encoding Field
        </InputLabel>
        <Select
          labelId={`${encoding}-encoding-field-label`}
          label={`${capitalize(encoding)} Encoding Field`}
          value={encodingSpec.field || ''}
          onChange={(event) =>
            onChange(`encoding.${encoding}.field`, event.target.value)
          }
        >
          {!fields.length && (
            <MenuItem value={''} disabled selected>
              You must select a dataset first!
            </MenuItem>
          )}
          {fields.map(({ field, headerName }) => (
            <MenuItem
              key={field}
              value={field}
              disabled={field === encodingSpec.field}
            >
              {headerName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

const applyChanges = (
  json: string,
  field: ChangableField,
  value?: string,
): string => {
  const parsed: Spec = JSON.parse(json);
  switch (field) {
    case 'data.name': {
      const data = { name: value };
      Object.assign(parsed, { data });
      break;
    }
    case 'mark.type': {
      const type = value as Mark;
      const mark = { type, tooltip: true };
      Object.assign(parsed, { mark });
      break;
    }
    case 'encoding.+x':
    case 'encoding.+y':
    case 'encoding.+color':
    case 'encoding.+opacity':
    case 'encoding.+size': {
      const encoding = parsed.encoding || {};
      const key = field.split('.+')[1] as Encoding;
      Object.assign(encoding, { [key]: {} });
      Object.assign(parsed, { encoding });
      break;
    }
    case 'encoding.x':
    case 'encoding.y':
    case 'encoding.color':
    case 'encoding.opacity':
    case 'encoding.size': {
      const encoding = parsed.encoding || {};
      const prev = field.split('.')[1] as Encoding;
      const curr = value as Encoding;

      // Validating that the previous encoding exists in the JSON
      if (!encoding[prev]) {
        break;
      }
      Object.assign(encoding, { [curr]: { ...encoding[prev] } });
      delete encoding[prev];
      Object.assign(parsed, { encoding });
      break;
    }
    case 'encoding.-x':
    case 'encoding.-y':
    case 'encoding.-color':
    case 'encoding.-opacity':
    case 'encoding.-size': {
      const encoding = parsed.encoding || {};
      const key = field.split('.-')[1] as Encoding;
      delete encoding[key];
      Object.assign(parsed, { encoding });
      break;
    }
    case 'encoding.x.field':
    case 'encoding.y.field':
    case 'encoding.color.field':
    case 'encoding.opacity.field':
    case 'encoding.size.field': {
      const encoding = parsed.encoding || {};
      const key = field.split('.')[1] as Encoding;
      const encodingSpec = encoding[key];

      // Validating that the encoding exists in the JSON
      if (!encodingSpec) {
        break;
      }
      Object.assign(encodingSpec, { ...encodingSpec, field: value });
      break;
    }
    default:
      console.warn(`Unknown changable field: ${field}`);
  }
  return JSON.stringify(parsed, null, 4);
};

const capitalize = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}`;
