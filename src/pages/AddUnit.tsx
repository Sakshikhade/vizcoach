import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, SpeedDialAction, TextField } from '@mui/material';
import { AddTask, CloudUpload, Save } from '@mui/icons-material';
import {
  Dashboard,
  FormField,
  ImageUpload,
  RichEditor,
  VisuallyHiddenInput,
} from 'components';
import client, {
  GetActivityResponse,
  UNSAVED_UNIT_REQUIRED_FIELDS,
  UnsavedUnit,
  UnsavedUnitField,
} from 'db';
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
      <Dashboard.Breadcrumbs title="Add Task">
        <Dashboard.Breadcrumbs.Link href="/dashboard/activities">
          Assignments
        </Dashboard.Breadcrumbs.Link>
        <Dashboard.Breadcrumbs.Link href={`../${activity.id}/units`}>
          {activity.title}
        </Dashboard.Breadcrumbs.Link>
      </Dashboard.Breadcrumbs>

      <Dashboard.Header
        heading="Add Task"
        subtitle={`Create new task for "${activity.title}" assignment.`}
      />

      <Alert variant="outlined" severity={errors.generic ? 'error' : 'info'}>
        {errors.generic ? (
          errors.generic
        ) : (
          <>
            Tasks hold description on how students should perform the work using
            the datasets.
          </>
        )}
      </Alert>

      <FormField label="What's the task's title?" error={errors.title} required>
        <TextField
          variant="outlined"
          value={unit.title || ''}
          onChange={(event) => setField('title', event.target.value)}
          required
        />
      </FormField>

      <FormField
        label="What's the task's description?"
        error={errors.description}
        required
      >
        <RichEditor
          value={unit.description}
          onChange={(value) => setField('description', value)}
        />
      </FormField>

      <FormField
        label="Which datasets to attach?"
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

      <FormField label="Reference Images (Optional)" error={errors.reference}>
        <ImageUpload
          files={unit.reference || []}
          onChange={(files) => setField('reference', files)}
          label="Upload reference images for 'recreate this image' type activities"
          maxFiles={5}
        />
      </FormField>

      <Dashboard.SpeedDial label="Add Task SpeedDial" icon={<AddTask />}>
        <SpeedDialAction
          icon={<Save />}
          tooltipTitle="Save Task"
          onClick={onSave}
        />
      </Dashboard.SpeedDial>
    </>
  );
};
