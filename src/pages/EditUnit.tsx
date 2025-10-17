import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, TextField, Typography, IconButton, Tooltip } from '@mui/material';
import { CloudUpload, Save } from '@mui/icons-material';
import {
  Dashboard,
  FormField,
  ImageUpload,
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
  const [uploadedReferenceFiles, setUploadedReferenceFiles] = useState<File[]>([]);
  const [existingDatasets] = useState<string[]>(unit.datasets || []);
  const [existingReferenceImages, setExistingReferenceImages] = useState<string[]>(
    Array.isArray(unit.reference) ? unit.reference : unit.reference ? [unit.reference] : []
  );
  const [errors, setErrors] = useState<FormErrorState>({});
  const navigate = useNavigate();

  const unsetField = (name: UnsavedUnitField) =>
    setEditedUnit((prev) => {
      delete prev[name];
      return prev;
    });

  const setField = (name: UnsavedUnitField, value?: string | File[] | File) => {
    if (name === 'datasets' && Array.isArray(value)) {
      setUploadedFiles(value as File[]);
      setErrors({});
      return;
    }
    if (name === 'reference' && Array.isArray(value)) {
      setUploadedReferenceFiles(value as File[]);
      setErrors({});
      return;
    }
    if (value === editedUnit[name]) return;
    if (!value || (Array.isArray(value) && !value.length)) {
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

  const removeExistingReferenceImage = (imageName: string) => {
    setExistingReferenceImages(prev => prev.filter(img => img !== imageName));
  };

  const onSave = async () => {
    try {
      // Clear any previous errors
      setErrors({});

      // Checking if all required fields are provided
      for (const field of UNSAVED_UNIT_REQUIRED_FIELDS) {
        if (field === 'datasets') {
          // For datasets, check if we have either new uploads OR existing datasets
          const hasNewDatasets = uploadedFiles.length > 0;
          const hasExistingDatasets = existingDatasets.length > 0;
          if (!hasNewDatasets && !hasExistingDatasets) {
            setError(field, `Unit's ${field} is required!`);
            return;
          }
        } else {
          const value = editedUnit[field];
          if (!value || !value.length) {
            setError(field, `Unit's ${field} is required!`);
            return;
          }
        }
      }

      // Prepare FormData for file uploads
      const formData = new FormData();
      
      // Add basic fields
      formData.append('title', editedUnit.title || unit.title);
      formData.append('description', editedUnit.description || unit.description);

      // Handle datasets - combine existing with new uploads
      // First, add existing datasets (as strings to preserve them)
      existingDatasets.forEach((datasetName) => {
        formData.append('datasets', datasetName);
      });
      
      // Then, add new dataset files
      uploadedFiles.forEach((file) => {
        formData.append('datasets', file);
      });

      // Handle reference images - combine existing with new uploads
      // First, add existing reference images (as strings to preserve them)
      existingReferenceImages.forEach((imageName) => {
        formData.append('reference', imageName);
      });
      
      // Then, add new reference image files
      uploadedReferenceFiles.forEach((file) => {
        formData.append('reference', file);
      });

      console.log('Saving unit with FormData containing files:', {
        datasets: [...existingDatasets, ...uploadedFiles.map(f => f.name)],
        reference: [...existingReferenceImages, ...uploadedReferenceFiles.map(f => f.name)]
      });

      // Update unit with FormData for proper file handling
      await client.pb.collection('units').update(unit.id, formData);
      
      // Fetch the updated unit
      const savedUnit = await client.getUnit(unit.activityId, unit.id);
      if (!savedUnit) {
        setError('generic', 'Unknown error occurred while updating this unit!');
        return;
      }

      console.log('Unit saved successfully, navigating to view page');
      navigate(`/dashboard/activities/${activity.id}/units/${unit.id}/view`);
    } catch (error) {
      console.error('Error saving unit:', error);
      setError('generic', 'An error occurred while saving the unit. Please try again.');
    }
  };

  return (
    <>
      <Dashboard.Breadcrumbs title="Edit Task">
        <Dashboard.Breadcrumbs.Link href="/dashboard/activities">
          Assignments
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
        heading="Edit Task"
        subtitle={`Update task details for "${activity.title}" assignment.`}
      >
        <Tooltip title="Save Changes">
          <IconButton
            onClick={onSave}
            color="primary"
            size="large"
          >
            <Save />
          </IconButton>
        </Tooltip>
      </Dashboard.Header>

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
          value={editedUnit.title || ''}
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
          {uploadedFiles.length + existingDatasets.length})
          <VisuallyHiddenInput
            type="file"
            accept=".csv"
            onChange={({ target }) =>
              setField('datasets', [...(target.files || [])])
            }
            multiple
          />
        </Button>
        {existingDatasets.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Current Datasets:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {existingDatasets.map((dataset, index) => (
                <Box
                  key={index}
                  sx={{
                    px: 2,
                    py: 1,
                    backgroundColor: 'grey.100',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.300',
                  }}
                >
                  <Typography variant="caption">{dataset}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </FormField>

      <FormField
        label="Reference Images (Optional)"
        error={errors.reference}
      >
        <ImageUpload
          files={uploadedReferenceFiles}
          onChange={(files) => setField('reference', files)}
          label="Upload reference images for 'recreate this image' type activities"
          maxFiles={5}
        />
        {existingReferenceImages.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Current Reference Images:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {existingReferenceImages.map((imageName, index) => (
                <Box
                  key={index}
                  sx={{
                    px: 2,
                    py: 1,
                    backgroundColor: 'grey.100',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    '&:hover': {
                      backgroundColor: 'grey.200',
                    },
                  }}
                >
                  <Typography variant="caption">{imageName}</Typography>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => removeExistingReferenceImage(imageName)}
                    sx={{ 
                      minWidth: 'auto', 
                      p: 0.5,
                      '&:hover': {
                        backgroundColor: 'error.light',
                        color: 'white',
                      },
                    }}
                  >
                    ×
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </FormField>
    </>
  );
};
