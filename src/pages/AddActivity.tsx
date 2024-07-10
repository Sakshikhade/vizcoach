import { PropsWithChildren, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Addchart, Save } from '@mui/icons-material';
import {
  Alert,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers';
import {
  DashboardBreadcrumbs,
  DashboardHeader,
  DashboardLayout,
  DashboardSpeedDial,
  RichEditor,
} from 'components';
import client, {
  UNSAVED_ACTIVITY_REQUIRED_FIELDS,
  UnsavedActivity,
  UnsavedActivityField,
} from 'db';
import { useGroupsLoader } from 'hooks';
import dayjs from 'dayjs';

type FormErrorState = UnsavedActivity & { generic?: string };

const GROUP_PLACEHOLDER = 'Select a Student Group';

export const AddActivity = () => {
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
    <DashboardLayout
      breadcrumbs={<Breadcrumbs />}
      header={<Header />}
      content={
        <Content activity={activity} errors={errors} setField={setField} />
      }
      speedDial={<SpeedDial onSave={onSave} />}
    />
  );
};

const Breadcrumbs = () => {
  return (
    <DashboardBreadcrumbs
      title="Add Activity"
      links={[
        {
          href: '/dashboard/activities',
          children: 'Activities',
        },
      ]}
    />
  );
};

const Header = () => {
  return (
    <DashboardHeader
      heading="Add Activity"
      subtitle="Create new activity for a student group."
    />
  );
};

type FormFieldProps = {
  label: string;
  required?: boolean;
  error?: string;
} & PropsWithChildren;

const FormField = ({ children, error, label, required }: FormFieldProps) => {
  return (
    <FormControl>
      <Stack direction="row" justifyContent="space-between">
        <Typography>{label}</Typography>
        {required && <Typography color="error">* required</Typography>}
      </Stack>
      {children}
      <Typography color="error">{error}</Typography>
    </FormControl>
  );
};

type ContentProps = {
  activity: UnsavedActivity;
  errors: FormErrorState;
  setField: (name: UnsavedActivityField, value: string) => void;
};

const Content = ({ activity, errors, setField }: ContentProps) => {
  const groups = useGroupsLoader();
  return (
    <>
      <Alert variant="outlined" severity={errors.generic ? 'error' : 'info'}>
        {errors.generic ? (
          errors.generic
        ) : (
          <>
            Activities will hold related units together and are meant to
            describe the assignment's general idea or theme that students will
            perform in related units.
          </>
        )}
      </Alert>
      <FormField
        label="What's the activity's title?"
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
        label="What's the activity's description?"
        error={errors.description}
        required
      >
        <RichEditor
          value={activity.description}
          onChange={(value) => setField('description', value)}
        />
      </FormField>
      <FormField
        label="Which Student Group should attempt this activity?"
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
    </>
  );
};

type SpeedDialProps = {
  onSave: () => void;
};

const SpeedDial = ({ onSave }: SpeedDialProps) => {
  return (
    <DashboardSpeedDial
      ariaLabel="Add Activity SpeedDial"
      openIcon={<Addchart />}
      actions={[
        {
          icon: <Save />,
          tooltipTitle: 'Save Activity',
          onClick: onSave,
        },
      ]}
    />
  );
};
