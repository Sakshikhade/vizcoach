import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, MenuItem, Paper, Select, SpeedDialAction } from '@mui/material';
import { GroupAdd, Save } from '@mui/icons-material';
import { YearCalendar } from '@mui/x-date-pickers';
import { Dashboard, FormField } from 'components';
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
  const navigate = useNavigate();

  const unsetField = (name: UnsavedGroupField) =>
    setGroup((prev) => {
      delete prev[name];
      return prev;
    });

  const setField = (name: UnsavedGroupField, value?: string | number) => {
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
        (typeof value === 'number' && value < new Date().getFullYear())
      ) {
        setError(field, `Group's ${field} is required!`);
        return;
      }
    }

    // Saving activity to database
    client.createGroup(group).then((savedGroup) => {
      if (!savedGroup) {
        setError(
          'generic',
          "Error occurred while creating this group! Kindly ensure that this group doesn't already exists.",
        );
        return;
      }
      navigate('/dashboard/groups');
    });
  };

  return (
    <>
      <Dashboard.Breadcrumbs title="Add Student Group">
        <Dashboard.Breadcrumbs.Link href="/dashboard/groups">
          Student Groups
        </Dashboard.Breadcrumbs.Link>
      </Dashboard.Breadcrumbs>

      <Dashboard.Header
        heading="Add Student Group"
        subtitle="Create new student group."
      />

      <Alert variant="outlined" severity={errors.generic ? 'error' : 'info'}>
        {errors.generic ? (
          errors.generic
        ) : (
          <>
            Activities linked to a student group will be visible to students in
            the group.
          </>
        )}
      </Alert>

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

      <Dashboard.SpeedDial label="Add Group SpeedDial" icon={<GroupAdd />}>
        <SpeedDialAction
          icon={<Save />}
          tooltipTitle="Save Group"
          onClick={onSave}
        />
      </Dashboard.SpeedDial>
    </>
  );
};
