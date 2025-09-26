import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, SpeedDialAction, TextField } from '@mui/material';
import { AddTask, CloudUpload, Save } from '@mui/icons-material';
import {
  Dashboard,
  FormField,
  RichEditor,
  VisuallyHiddenInput,
} from 'components';
import client, {
  GetUnitResponse,
  UNSAVED_UNIT_REQUIRED_FIELDS,
  UnsavedUnit,
  UnsavedUnitField,
} from 'db';
import { useDashboard } from 'hooks';

type FormErrorState = Partial<{
  [key in UnsavedUnitField | 'generic']: string;
}>;

export const EditUnit = () => {
  const { useData } = useDashboard();
  const { activity, unit } = useData!<GetUnitResponse>();
  const [editedUnit, setEditedUnit] = useState<UnsavedUnit>({
    title: unit.title,
    description: unit.description,
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrorState>({});
  const navigate = useNavigate();

  const unsetField = (name: UnsavedUnitField) =>
    setEditedUnit((prev) => {
      delete prev[name];
      return prev;
    });

  const setField = (name: UnsavedUnitField, value?: string | File[]) => {
    if (name === 'datasets' && Array.isArray(value)) {
      setUploadedFiles(value as File[]);
      setErrors({});
      return;
    }
    if (value === editedUnit[name]) return;
    if (!value || !value.length) {
      unsetField(name);
      return;
    }
    setEditedUnit((prev) => ({
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
      const value = editedUnit[field];
      if (!value || !value.length) {
        setError(field, `Unit's ${field} is required!`);
        return;
      }
    }

    // Creating updated unit object
    const updatedUnit = {
      ...unit,
      ...editedUnit,
      datasets:
        uploadedFiles.length > 0
          ? uploadedFiles.map((f) => f.name)
          : unit.datasets,
    };

    // Saving unit to database
    client.updateUnit(updatedUnit).then((savedUnit) => {
      if (!savedUnit) {
        setError('generic', 'Unknown error occurred while updating this unit!');
        return;
      }
      navigate(`/dashboard/activities/${activity.id}/units/${unit.id}/view`);
    });
  };

  return (
    <>
      <Dashboard.Breadcrumbs title="Edit Unit">
        <Dashboard.Breadcrumbs.Link href="/dashboard/activities">
          Activities
        </Dashboard.Breadcrumbs.Link>
        <Dashboard.Breadcrumbs.Link
          href={`/dashboard/activities/${activity.id}/units`}
        >
          {activity.title}
        </Dashboard.Breadcrumbs.Link>
        <Dashboard.Breadcrumbs.Link
          href={`/dashboard/activities/${activity.id}/units/${unit.id}/view`}
        >
          {unit.title}
        </Dashboard.Breadcrumbs.Link>
      </Dashboard.Breadcrumbs>

      <Dashboard.Header
        heading="Edit Unit"
        subtitle={`Update unit details for "${activity.title}" activity.`}
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
          value={editedUnit.title || ''}
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
          value={editedUnit.description}
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
          Upload Datasets (
          {uploadedFiles.length || editedUnit.datasets?.length || 0})
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

      <Dashboard.SpeedDial label="Edit Unit SpeedDial" icon={<AddTask />}>
        <SpeedDialAction
          icon={<Save />}
          tooltipTitle="Save Changes"
          onClick={onSave}
        />
      </Dashboard.SpeedDial>
    </>
  );
};
