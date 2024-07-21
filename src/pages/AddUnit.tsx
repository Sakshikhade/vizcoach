import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  SpeedDialAction,
  styled,
  TextField,
} from '@mui/material';
import { Dashboard, FormField, RichEditor } from 'components';
import client, {
  GetActivityResponse,
  UNSAVED_UNIT_REQUIRED_FIELDS,
  UnsavedUnit,
  UnsavedUnitField,
} from 'db';
import { useState } from 'react';
import { AddTask, CloudUpload, Save } from '@mui/icons-material';
import { useDashboard } from 'hooks';

type FormErrorState = Partial<{
  [key in UnsavedUnitField | 'generic']: string;
}>;

export const AddUnit = () => {
  const { useData } = useDashboard();
  const { activity, units } = useData!<GetActivityResponse>();
  const [unit, setUnit] = useState<UnsavedUnit>({});
  const [errors, setErrors] = useState<FormErrorState>({});
  const navigate = useNavigate();

  const unsetField = (name: UnsavedUnitField) =>
    setUnit((prev) => {
      delete prev[name];
      return prev;
    });

  const setField = (name: UnsavedUnitField, value?: string | File[]) => {
    if (value === unit[name]) return;
    if (!value || !value.length) {
      unsetField(name);
      return;
    }
    setUnit((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors({});
  };

  const setError = (name: keyof FormErrorState, value: string) =>
    setErrors((prev) => ({ ...prev, [name]: value }));

  const onSave = () => {
    // Checking if all required fields are provided
    for (const field of UNSAVED_UNIT_REQUIRED_FIELDS) {
      const value = unit[field];
      if (!value || !value.length) {
        setError(field, `Unit's ${field} is required!`);
        return;
      }
    }

    // Checking if activity has less than 5 units
    if (units.length >= 5) {
      setError(
        'generic',
        `This activity already has ${units.length} units! You can not add more than 5 units per activity.`,
      );
    }

    // Adding hidden values
    unit.activityId = activity.id;
    unit.order = units.length + 1;

    // Saving unit to database
    client.createUnit(unit).then((savedUnit) => {
      if (!savedUnit) {
        setError('generic', 'Unknown error occurred while creating this unit!');
        return;
      }
      navigate(`/dashboard/activities/${activity.id}/units`);
    });
  };

  return (
    <>
      <Dashboard.Breadcrumbs title="Add Unit">
        <Dashboard.Breadcrumbs.Link href="/dashboard/activities">
          Activities
        </Dashboard.Breadcrumbs.Link>
        <Dashboard.Breadcrumbs.Link href={`../${activity.id}/units`}>
          {activity.title}
        </Dashboard.Breadcrumbs.Link>
      </Dashboard.Breadcrumbs>

      <Dashboard.Header
        heading="Add Unit"
        subtitle={`Create new unit for "${activity.title}" activity.`}
      />

      <Alert variant="outlined" severity={errors.generic ? 'error' : 'info'}>
        {errors.generic ? (
          errors.generic
        ) : (
          <>
            Units hold description on how students should perform the task using
            the datasets.
          </>
        )}
      </Alert>

      <FormField label="What's the unit's title?" error={errors.title} required>
        <TextField
          variant="outlined"
          value={unit.title || ''}
          onChange={(event) => setField('title', event.target.value)}
          required
        />
      </FormField>

      <FormField
        label="What's the unit's description?"
        error={errors.description}
        required
      >
        <RichEditor
          value={unit.description}
          onChange={(value) => setField('description', value)}
        />
      </FormField>

      <FormField
        label="What's the unit's description?"
        error={errors.datasets}
        required
      >
        <Button
          component="label"
          role={undefined}
          variant="outlined"
          tabIndex={-1}
          startIcon={<CloudUpload />}
          sx={{ width: 'fit-content', marginTop: 1 }}
        >
          Upload Datasets ({unit.datasets?.length || 0})
          <VisuallyHiddenInput
            type="file"
            accept=".csv"
            onChange={({ target }) =>
              setField('datasets', [...(target.files || [])])
            }
            multiple
          />
        </Button>
      </FormField>

      <Dashboard.SpeedDial label="Add Unit SpeedDial" icon={<AddTask />}>
        <SpeedDialAction
          icon={<Save />}
          tooltipTitle="Save Unit"
          onClick={onSave}
        />
      </Dashboard.SpeedDial>
    </>
  );
};

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});
