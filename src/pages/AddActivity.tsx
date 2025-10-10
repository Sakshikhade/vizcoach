import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Addchart, Save } from '@mui/icons-material';
import {
  Alert,
  MenuItem,
  Paper,
  Select,
  SpeedDialAction,
  TextField,
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers';
import { Dashboard, FormField, RichEditor } from 'components';
import client, {
  Group,
  UNSAVED_ACTIVITY_REQUIRED_FIELDS,
  UnsavedActivity,
  UnsavedActivityField,
} from 'db';
import { useDashboard } from 'hooks';
import dayjs from 'dayjs';

type FormErrorState = UnsavedActivity & { generic?: string };

const GROUP_PLACEHOLDER = 'Select a Class';

export const AddActivity = () => {
  const { useData } = useDashboard();
  const groups = useData!<Group[]>();
  const [activity, setActivity] = useState<UnsavedActivity>({});
  const [errors, setErrors] = useState<FormErrorState>({});
  const navigate = useNavigate();

  const unsetField = (name: UnsavedActivityField) =>
    setActivity((prev) => {
      delete prev[name];
      return prev;
    });

  const setField = (name: UnsavedActivityField, value?: string) => {
    if (value === activity[name]) return;
    if (
      !value ||
      !value.length ||
      (name === 'description' && value === '<p></p>')
    ) {
      unsetField(name);
      return;
    }
    setActivity((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors({});
  };

  const setError = (name: keyof FormErrorState, value?: string) =>
    setErrors((prev) => ({ ...prev, [name]: value }));

  const onSave = () => {
    // Checking if all required fields are provided
    for (const field of UNSAVED_ACTIVITY_REQUIRED_FIELDS) {
      const value = activity[field];
      if (!value || !value.length) {
        setError(field, `Activity's ${field} is required!`);
        return;
      }
    }

    // Saving activity to database
    client.createActivity(activity).then((savedActivity) => {
      if (!savedActivity) {
        setError(
          'generic',
          'Unknown error occurred while creating this activity!',
        );
        return;
      }
      navigate('/dashboard/activities');
    });
  };

  return (
    <>
      <Dashboard.Breadcrumbs title="Add Assignment">
        <Dashboard.Breadcrumbs.Link href="/dashboard/activities">
          Assignments
        </Dashboard.Breadcrumbs.Link>
      </Dashboard.Breadcrumbs>

      <Dashboard.Header
        heading="Add Assignment"
        subtitle="Create new assignment for a class."
      />

      <Alert variant="outlined" severity={errors.generic ? 'error' : 'info'}>
        {errors.generic ? (
          errors.generic
        ) : (
          <>
            Assignments will hold related tasks together and are meant to
            describe the assignment's general idea or theme that students will
            perform in related tasks.
          </>
        )}
      </Alert>

      <FormField
        label="What's the assignment's title?"
        error={errors.title}
        required
      >
        <TextField
          variant="outlined"
          value={activity.title || ''}
          onChange={(event) => setField('title', event.target.value)}
          required
        />
      </FormField>

      <FormField
        label="What's the assignment's description?"
        error={errors.description}
        required
      >
        <RichEditor
          value={activity.description}
          onChange={(value) => setField('description', value)}
        />
      </FormField>

      <FormField
        label="Which class should attempt this assignment?"
        error={errors.groupId}
        required
      >
        <Select
          value={activity.groupId || GROUP_PLACEHOLDER}
          onChange={(event) => setField('groupId', event.target.value)}
          required
        >
          <MenuItem value={GROUP_PLACEHOLDER} disabled>
            {GROUP_PLACEHOLDER}
          </MenuItem>
          {groups.map((group) => (
            <MenuItem key={group.id} value={group.id}>
              {group.title}
            </MenuItem>
          ))}
        </Select>
      </FormField>

      <FormField
        label="When to schedule this activity?"
        error={errors.scheduled}
      >
        <Paper variant="outlined">
          <DateCalendar
            sx={{ width: '100%' }}
            value={activity.scheduled ? dayjs(activity.scheduled) : null}
            onChange={(date: dayjs.Dayjs) => {
              if (!date || !date.isValid()) return;
              setField(
                'scheduled',
                new Date(date.toDate().toLocaleDateString()).toISOString(),
              );
            }}
            disablePast
          />
        </Paper>
      </FormField>

      <Dashboard.SpeedDial label="Add Activity SpeedDial" icon={<Addchart />}>
        <SpeedDialAction
          icon={<Save />}
          tooltipTitle="Save Activity"
          onClick={onSave}
        />
      </Dashboard.SpeedDial>
    </>
  );
};
