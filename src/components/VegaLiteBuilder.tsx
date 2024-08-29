import { useMemo, useState } from 'react';
import { VisualizationSpec } from 'react-vega';
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { Add, Delete, Settings } from '@mui/icons-material';
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

const aggregates = [
  'count',
  'valid',
  'values',
  'missing',
  'distinct',
  'sum',
  'product',
  'mean',
  'average',
  'variance',
  'variancep',
  'stdev',
  'stdevp',
  'stderr',
  'median',
  'q1',
  'q3',
  'ci0',
  'ci1',
  'min',
  'max',
  'argmin',
  'argmax',
] as const;
type Aggregate = (typeof aggregates)[number];

const scaleTypes = [
  'linear',
  'pow',
  'sqrt',
  'symlog',
  'log',
  'time',
  'utc',
  'band',
  'point',
  'bin-ordinal',
  'quantile',
  'quantize',
  'threshold',
] as const;
type ScaleType = (typeof scaleTypes)[number];

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
        aggregate: Aggregate;
        bin: boolean;
        scale: Partial<{
          type: ScaleType;
        }>;
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
  | 'encoding.size.field'

  // Update Encoding type
  | 'encoding.x.type'
  | 'encoding.y.type'
  | 'encoding.color.type'
  | 'encoding.opacity.type'
  | 'encoding.size.type'

  // Update Encoding aggregate
  | 'encoding.x.aggregate'
  | 'encoding.y.aggregate'
  | 'encoding.color.aggregate'
  | 'encoding.opacity.aggregate'
  | 'encoding.size.aggregate'

  // Update Encoding bin
  | 'encoding.x.bin'
  | 'encoding.y.bin'
  | 'encoding.color.bin'
  | 'encoding.opacity.bin'
  | 'encoding.size.bin'

  // Update Encoding scale type
  | 'encoding.x.scale.type'
  | 'encoding.y.scale.type'
  | 'encoding.color.scale.type'
  | 'encoding.opacity.scale.type'
  | 'encoding.size.scale.type';

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

  const onChange = (field: ChangableField, value?: string | boolean) => {
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
    <Stack gap={3}>
      <FormControl disabled={readOnly} fullWidth>
        <InputLabel id="dataset-label" size="small">
          Dataset
        </InputLabel>
        <Select
          labelId="dataset-label"
          label="Dataset"
          value={spec.data?.name}
          onChange={(event) => onChange('data.name', event.target.value)}
          size="small"
        >
          {datasets.map((dataset, i) => (
            <MenuItem key={dataset.name} value={dataset.name}>
              {dataset.name} ({i + 1}.csv)
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl disabled={readOnly} fullWidth>
        <InputLabel id="mark-label" size="small">
          Mark
        </InputLabel>
        <Select
          labelId="mark-label"
          label="Mark"
          value={spec.mark?.type || ''}
          onChange={(event) => onChange('mark.type', event.target.value)}
          size="small"
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
  onChange: (field: ChangableField, value?: string | boolean) => void;
  readOnly?: boolean;
};

const EncodingBuilder = ({
  datasets,
  encoding,
  spec,
  onChange,
  readOnly,
}: EncodingBuilderProps) => {
  const [showOptions, setShowOptions] = useState(false);

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

  const toggle = () => setShowOptions((prev) => !prev);

  return (
    <>
      <Stack direction="row" gap={1} flex="auto 1 1">
        <FormControl disabled={readOnly} fullWidth>
          <InputLabel id={`${encoding}-encoding-label`} size="small">
            {capitalize(encoding)} Encoding
          </InputLabel>
          <Select
            labelId={`${encoding}-encoding-label`}
            label={`${capitalize(encoding)} Encoding`}
            value={encoding}
            onChange={(event) =>
              onChange(`encoding.${encoding}`, event.target.value)
            }
            size="small"
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
        <IconButton onClick={toggle} size="small">
          <Settings />
        </IconButton>
        <IconButton
          onClick={() => onChange(`encoding.-${encoding}`)}
          size="small"
        >
          <Delete />
        </IconButton>
      </Stack>
      {showOptions && (
        <Paper variant="outlined">
          <Stack gap={3} padding={3}>
            <Typography>{capitalize(encoding)} Encoding Options</Typography>
            <FormControl disabled={readOnly} fullWidth>
              <InputLabel id={`${encoding}-encoding-field-label`} size="small">
                Field
              </InputLabel>
              <Select
                labelId={`${encoding}-encoding-field-label`}
                label="Field"
                value={encodingSpec.field || ''}
                onChange={(event) =>
                  onChange(`encoding.${encoding}.field`, event.target.value)
                }
                size="small"
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
            <FormControl disabled={readOnly} fullWidth>
              <InputLabel id={`${encoding}-encoding-type-label`} size="small">
                Type
              </InputLabel>
              <Select
                labelId={`${encoding}-encoding-type-label`}
                label="Type"
                value={encodingSpec.type || ''}
                onChange={(event) =>
                  onChange(`encoding.${encoding}.type`, event.target.value)
                }
                size="small"
              >
                {encodingTypes.map((type) => (
                  <MenuItem
                    key={type}
                    value={type}
                    disabled={type === encodingSpec.type}
                  >
                    {capitalize(type)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl disabled={readOnly} fullWidth>
              <InputLabel
                id={`${encoding}-encoding-aggregate-label`}
                size="small"
              >
                Aggregate
              </InputLabel>
              <Select
                labelId={`${encoding}-encoding-aggregate-label`}
                label="Aggregate"
                value={encodingSpec.aggregate || ''}
                onChange={(event) =>
                  onChange(`encoding.${encoding}.aggregate`, event.target.value)
                }
                size="small"
              >
                <MenuItem value={''}>(Empty)</MenuItem>
                {aggregates.map((aggregate) => (
                  <MenuItem
                    key={aggregate}
                    value={aggregate}
                    disabled={aggregate === encodingSpec.aggregate}
                  >
                    {capitalize(aggregate)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl disabled={readOnly} fullWidth>
              <InputLabel
                id={`${encoding}-encoding-scale-type-label`}
                size="small"
              >
                Scale
              </InputLabel>
              <Select
                labelId={`${encoding}-encoding-scale-type-label`}
                label="Scale"
                value={encodingSpec.scale?.type || ''}
                onChange={(event) =>
                  onChange(
                    `encoding.${encoding}.scale.type`,
                    event.target.value,
                  )
                }
                size="small"
              >
                <MenuItem value={''}>(Empty)</MenuItem>
                {scaleTypes.map((type) => (
                  <MenuItem
                    key={type}
                    value={type}
                    disabled={type === encodingSpec.scale?.type}
                  >
                    {capitalize(type)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              disabled={readOnly}
              label="Bin"
              control={<Checkbox checked={encodingSpec.bin} size="small" />}
              onChange={(_, checked) =>
                onChange(`encoding.${encoding}.bin`, checked)
              }
            />
          </Stack>
        </Paper>
      )}
    </>
  );
};

const applyChanges = (
  json: string,
  field: ChangableField,
  value?: string | boolean,
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
    case 'encoding.size.field':
    case 'encoding.x.type':
    case 'encoding.y.type':
    case 'encoding.color.type':
    case 'encoding.opacity.type':
    case 'encoding.size.type':
    case 'encoding.x.aggregate':
    case 'encoding.y.aggregate':
    case 'encoding.color.aggregate':
    case 'encoding.opacity.aggregate':
    case 'encoding.size.aggregate':
    case 'encoding.x.bin':
    case 'encoding.y.bin':
    case 'encoding.color.bin':
    case 'encoding.opacity.bin':
    case 'encoding.size.bin': {
      const encoding = parsed.encoding || {};
      const splits = field.split('.');
      const encodingKey = splits[1] as Encoding;
      const encodingProperty = splits[2];
      const encodingSpec = encoding[encodingKey];

      // Validating that the encoding exists in the JSON
      if (!encodingSpec) {
        break;
      }
      Object.assign(encodingSpec, {
        ...encodingSpec,
        [encodingProperty]: value,
      });
      break;
    }
    case 'encoding.x.scale.type':
    case 'encoding.y.scale.type':
    case 'encoding.color.scale.type':
    case 'encoding.opacity.scale.type':
    case 'encoding.size.scale.type': {
      const encoding = parsed.encoding || {};
      const key = field.split('.')[1] as Encoding;
      const encodingSpec = encoding[key];

      // Validating that the encoding exists in the JSON
      if (!encodingSpec) {
        break;
      }

      const scale = encodingSpec.scale || {};
      Object.assign(scale, { ...scale, type: value });
      Object.assign(encodingSpec, { scale });
      break;
    }
    default:
      console.warn(`Unknown changable field: ${field}`);
  }
  return JSON.stringify(parsed, null, 4);
};

const capitalize = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}`;
