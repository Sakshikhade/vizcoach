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
  Activity,
  Group,
  UNSAVED_ACTIVITY_REQUIRED_FIELDS,
  UnsavedActivity,
  UnsavedActivityField,
} from 'db';
import { useDashboard } from 'hooks';
import dayjs from 'dayjs';

type FormErrorState = UnsavedActivity & { generic?: string };

const GROUP_PLACEHOLDER = 'Select a Student Group';

export const EditActivity = () => {
  const { useData } = useDashboard();
  const { activity, groups } = useData!<{
    activity: Activity;
    groups: Group[];
  }>();
  const [editedActivity, setEditedActivity] = useState<UnsavedActivity>({
    title: activity.title,
    description: activity.description,
    groupId: activity.group.id,
    scheduled:
      activity.scheduled && !isNaN(activity.scheduled.getTime())
        ? activity.scheduled.toISOString()
        : undefined,
  });
  const [errors, setErrors] = useState<FormErrorState>({});
  const navigate = useNavigate();

  const unsetField = (name: UnsavedActivityField) =>
    setEditedActivity((prev) => {
      delete prev[name];
      return prev;
    });

  const setField = (name: UnsavedActivityField, value?: string) => {
    if (value === editedActivity[name]) return;
    if (
      !value ||
      !value.length ||
      (name === 'description' && value === '<p></p>')
    ) {
      unsetField(name);
      return;
    }
    setEditedActivity((prev) => ({
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
      const value = editedActivity[field];
      if (!value || !value.length) {
        setError(field, `Activity's ${field} is required!`);
        return;
      }
    }

    // Creating updated activity object
    const updatedActivity = new Activity(
      {
        ...activity.model,
        ...editedActivity,
      },
      activity.unitsCount,
    );

    // Saving activity to database
    client.updateActivity(updatedActivity).then((savedActivity) => {
      if (!savedActivity) {
        setError(
          'generic',
          'Unknown error occurred while updating this activity!',
        );
        return;
      }
      navigate(`/dashboard/activities/${activity.id}/units`);
    });
  };

  return (
    <>
      <Dashboard.Breadcrumbs title="Edit Assignment">
        <Dashboard.Breadcrumbs.Link href="/dashboard/activities">
          Assignments
        </Dashboard.Breadcrumbs.Link>
        <Dashboard.Breadcrumbs.Link
          href={`/dashboard/activities/${activity.id}/units`}
        >
          {activity.title}
        </Dashboard.Breadcrumbs.Link>
      </Dashboard.Breadcrumbs>

      <Dashboard.Header
        heading="Edit Assignment"
        subtitle="Update assignment details for a class."
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
          value={editedActivity.title || ''}
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
          value={editedActivity.description}
          onChange={(value) => setField('description', value)}
        />
      </FormField>

      <FormField
        label="Which class should attempt this assignment?"
        error={errors.groupId}
        required
      >
        <Select
          value={editedActivity.groupId || GROUP_PLACEHOLDER}
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
            value={
              editedActivity.scheduled ? dayjs(editedActivity.scheduled) : null
            }
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

      <Dashboard.SpeedDial label="Edit Activity SpeedDial" icon={<Addchart />}>
        <SpeedDialAction
          icon={<Save />}
          tooltipTitle="Save Changes"
          onClick={onSave}
        />
      </Dashboard.SpeedDial>
    </>
  );
};
