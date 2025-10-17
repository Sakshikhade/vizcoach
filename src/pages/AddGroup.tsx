import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Select,
  SpeedDialAction,
} from '@mui/material';
import { CloudUpload, GroupAdd, Save } from '@mui/icons-material';
import { YearCalendar } from '@mui/x-date-pickers';
import { Dashboard, FormField, VisuallyHiddenInput } from 'components';
import client, {
  UNSAVED_GROUP_FIELDS,
  UnsavedGroup,
  UnsavedGroupField,
} from 'db';
import dayjs from 'dayjs';

type FormErrorState = Partial<{
  [key in UnsavedGroupField | 'generic']: string;
}>;

const COURSE_PLACEHOLDER = 'Select course';
const SEMESTER_PLACEHOLDER = 'Select semester';
const GROUP_COURSES = ['CSE578'] as const;
const GROUP_SEMESTERS = ['Spring', 'Summer', 'Fall'] as const;

export const AddGroup = () => {
  const [group, setGroup] = useState<UnsavedGroup>({});
  const [errors, setErrors] = useState<FormErrorState>({});
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const unsetField = (name: UnsavedGroupField) =>
    setGroup((prev) => {
      delete prev[name];
      return prev;
    });

  const setField = (
    name: UnsavedGroupField,
    value?: string | number | File,
  ) => {
    if (value === group[name]) return;
    if (!value) {
      unsetField(name);
      return;
    }
    setGroup((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors({});
  };

  const setError = (name: keyof FormErrorState, value?: string) =>
    setErrors((prev) => ({ ...prev, [name]: value }));

  const onSave = () => {
    // Checking if all required fields are provided
    for (const field of UNSAVED_GROUP_FIELDS) {
      const value = group[field];
      if (
        !value ||
        (typeof value === 'string' && !value.length) ||
        (typeof value === 'number' && value < new Date().getFullYear()) ||
        (value instanceof File && (!value.size || value.type !== 'text/csv'))
      ) {
        setError(field, `Group's ${field} is required!`);
        return;
      }
    }

    // Saving activity to database
    setSaving(true);
    client
      .createGroup(group)
      .then((savedGroup) => {
        if (!savedGroup) {
          setError(
            'generic',
            "Error occurred while creating this group! Kindly ensure that this group doesn't already exists.",
          );
          return;
        }
        navigate('/dashboard/groups');
      })
      .finally(() => setSaving(false));
  };

  return (
    <>
      <Dashboard.Breadcrumbs title="Add Class">
        <Dashboard.Breadcrumbs.Link href="/dashboard/groups">
          Classes
        </Dashboard.Breadcrumbs.Link>
      </Dashboard.Breadcrumbs>

      <Dashboard.Header heading="Add Class" subtitle="Create new class." />

      <Alert
        variant="outlined"
        severity={errors.generic ? 'error' : 'info'}
        icon={saving ? <CircularProgress size="1.5rem" /> : undefined}
      >
        {errors.generic ? (
          errors.generic
        ) : saving ? (
          <>Please wait while we create student accounts...</>
        ) : (
          <>
            Assignments linked to a class will be visible to students in the
            class.
          </>
        )}
      </Alert>

      <FormField
        label="Which Students CSV to attach?"
        error={errors['csv+']}
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
          Upload Students CSV ({group['csv+']?.name || 'Not Selected'})
          <VisuallyHiddenInput
            type="file"
            accept=".csv"
            onChange={({ target }) =>
              setField(
                'csv+',
                target.files && target.files.length
                  ? target.files[0]
                  : undefined,
              )
            }
          />
        </Button>
      </FormField>

      <FormField label="Student Group's Course?" error={errors.course} required>
        <Select
          value={group.course || COURSE_PLACEHOLDER}
          onChange={(event) => setField('course', event.target.value)}
        >
          <MenuItem value={COURSE_PLACEHOLDER} disabled>
            {COURSE_PLACEHOLDER}
          </MenuItem>
          {GROUP_COURSES.map((course) => (
            <MenuItem key={course} value={course}>
              {course}
            </MenuItem>
          ))}
        </Select>
      </FormField>

      <FormField
        label="Student Group's Semester?"
        error={errors.semester}
        required
      >
        <Select
          value={group.semester || SEMESTER_PLACEHOLDER}
          onChange={(event) => setField('semester', event.target.value)}
        >
          <MenuItem value={SEMESTER_PLACEHOLDER} disabled>
            {SEMESTER_PLACEHOLDER}
          </MenuItem>
          {GROUP_SEMESTERS.map((semester) => (
            <MenuItem key={semester} value={semester}>
              {semester}
            </MenuItem>
          ))}
        </Select>
      </FormField>

      <FormField label="Student Group's Year?" error={errors.year} required>
        <Paper variant="outlined">
          <YearCalendar
            minDate={dayjs(new Date())}
            sx={{ margin: 'auto' }}
            onChange={(date: dayjs.Dayjs) => setField('year', date.year())}
          />
        </Paper>
      </FormField>

      {!saving && (
        <Dashboard.SpeedDial label="Add Group SpeedDial" icon={<GroupAdd />}>
          <SpeedDialAction
            icon={<Save />}
            tooltipTitle="Save Group"
            onClick={onSave}
          />
        </Dashboard.SpeedDial>
      )}
    </>
  );
};
