import { ChangeEvent, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { FormControl, TextField } from '@mui/material';
import { Addchart, BarChart } from '@mui/icons-material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import {
  ActivityCard,
  DashboardBreadcrumbs,
  DashboardHeader,
  DashboardLayout,
  DashboardSpeedDial,
} from 'components';
import { Activity, User } from 'db';
import { useAuth } from 'hooks';

export const Activities = () => {
  const activities = useLoaderData() as Activity[];
  const [filteredActivities, setFilteredActivities] =
    useState<Activity[]>(activities);
  const { user } = useAuth();
  return (
    <DashboardLayout
      breadcrumbs={<DashboardBreadcrumbs title="Activities" />}
      header={
        <ActivitiesBreadcrumbs
          user={user}
          activities={activities}
          setFilteredActivities={setFilteredActivities}
        />
      }
      content={<ActivitiesContent activities={filteredActivities} />}
      speedDial={<ActivitiesSpeedDial user={user} />}
    />
  );
};

type ActivitiesBreadcrumbsProps = {
  user: User | null;
} & ActivitiesFilterControlProps;

const ActivitiesBreadcrumbs = (props: ActivitiesBreadcrumbsProps) => {
  const { user } = props;
  return (
    <DashboardHeader
      heading="Activities"
      subtitle={
        user?.role === 'Teacher'
          ? 'Create, manage, and track activities.'
          : 'Welcome, track your assigned activities.'
      }
      options={<ActivitiesFilterControl {...props} />}
    />
  );
};

type ActivitiesFilterControlProps = {
  activities: Activity[];
  setFilteredActivities: (activities: Activity[]) => void;
};

const ActivitiesFilterControl = ({
  activities,
  setFilteredActivities,
}: ActivitiesFilterControlProps) => {
  const onFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = (event.target.value || '').toLowerCase();
    if (!value.length) {
      setFilteredActivities(activities);
    }
    const filteredActivities = activities.filter((activity) => {
      const { title, description, group } = activity;
      const searchTexts = [
        title.toLowerCase(),
        description.toLowerCase(),
        group.valid ? group.title.toLowerCase() : '',
      ];
      return searchTexts.some((text) => text.includes(value));
    });
    setFilteredActivities(filteredActivities);
  };

  return (
    <FormControl>
      <TextField
        id="outlined-basic"
        label="Filter"
        variant="outlined"
        onChange={onFilterChange}
      />
    </FormControl>
  );
};

type ActivitiesContentProps = {
  activities: Activity[];
};

const ActivitiesContent = ({ activities }: ActivitiesContentProps) => {
  return (
    <Grid2 container rowSpacing={1} columnSpacing={1}>
      {activities.map((activity) => {
        return (
          <Grid2 key={activity.id} xs={12} md={6} lg={4}>
            <ActivityCard activity={activity} />
          </Grid2>
        );
      })}
    </Grid2>
  );
};

type ActivitiesSpeedDialProps = {
  user: User | null;
};

const ActivitiesSpeedDial = ({ user }: ActivitiesSpeedDialProps) => {
  if (user?.role !== 'Teacher') return null;
  return (
    <DashboardSpeedDial
      ariaLabel="Activities SpeedDial"
      openIcon={<BarChart />}
      actions={[
        {
          icon: <Addchart />,
          tooltipTitle: 'Add Activity',
        },
      ]}
    />
  );
};
