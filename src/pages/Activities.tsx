import { ChangeEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormControl, SpeedDialAction, TextField } from '@mui/material';
import { Addchart, BarChart } from '@mui/icons-material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { ActivityCard, Dashboard } from 'components';
import { Activity } from 'db';
import { useDashboard } from 'hooks';

export const Activities = () => {
  const { user, useData } = useDashboard();
  const allActivities = useData!<Activity[]>();
  const [activities, setActivities] = useState<Activity[]>(allActivities);
  const navigate = useNavigate();

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = (event.target.value || '').toLowerCase();
    if (!value.length) {
      setActivities(allActivities);
    }
    const filteredActivities = allActivities.filter((activity) => {
      const { title, description, group } = activity;
      const searchTexts = [
        title.toLowerCase(),
        description.toLowerCase(),
        group.valid ? group.title.toLowerCase() : '',
      ];
      return searchTexts.some((text) => text.includes(value));
    });
    setActivities(filteredActivities);
  };

  return (
    <>
      <Dashboard.Breadcrumbs title="Activities" />

      <Dashboard.Header
        heading="Activities"
        subtitle={
          user?.role === 'Teacher'
            ? 'Create, manage, and track activities.'
            : 'Welcome, track your assigned activities.'
        }
      >
        <FormControl>
          <TextField
            id="outlined-basic"
            label="Filter"
            variant="outlined"
            onChange={onChange}
          />
        </FormControl>
      </Dashboard.Header>

      <Grid2 container rowSpacing={1} columnSpacing={1}>
        {activities.map((activity) => {
          return (
            <Grid2 key={activity.id} xs={12} md={6} lg={4}>
              <ActivityCard activity={activity} />
            </Grid2>
          );
        })}
      </Grid2>

      {user?.role === 'Teacher' && (
        <Dashboard.SpeedDial label="Activities SpeedDial" icon={<BarChart />}>
          <SpeedDialAction
            icon={<Addchart />}
            tooltipTitle="Add Activity"
            onClick={() => navigate('add-activity')}
          />
        </Dashboard.SpeedDial>
      )}
    </>
  );
};
