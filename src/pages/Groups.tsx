import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group as GroupIcon, GroupAdd } from '@mui/icons-material';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  SpeedDialAction,
} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Dashboard, GroupCard } from 'components';
import { Group } from 'db';
import { useDashboard } from 'hooks';

const ALL_CLASSES = 'All Classes';

export const Groups = () => {
  const { useData } = useDashboard();
  const allGroups = useData!<Group[]>();
  const [groups, setGroups] = useState<Group[]>([]);
  const navigate = useNavigate();

  const courses = useMemo(
    () => [...new Set(allGroups.map(({ course }) => course))],
    [allGroups],
  );
  const semesters = useMemo(
    () => [...new Set(allGroups.map(({ semester }) => semester))],
    [allGroups],
  );
  const years = useMemo(
    () => [...new Set(allGroups.map(({ year }) => year))],
    [allGroups],
  );

  const [filters, setFilters] = useState<(string | number)[]>([ALL_CLASSES]);

  const onChange = (event: SelectChangeEvent<typeof filters>) => {
    const { value } = event.target;
    let filters = typeof value === 'string' ? value.split(',') : value;
    filters = filters.filter((filter) => filter !== ALL_CLASSES);
    if (!filters.length) filters.push(ALL_CLASSES);
    setFilters(filters);
  };

  useEffect(() => {
    if (filters.includes(ALL_CLASSES)) {
      setGroups(allGroups);
    } else {
      const filteredGroups = allGroups.filter(({ course, semester, year }) => {
        return (
          filters.includes(course) ||
          filters.includes(semester) ||
          filters.includes(year)
        );
      });
      setGroups(filteredGroups);
    }
  }, [allGroups, filters, setGroups]);

  return (
    <>
      <Dashboard.Breadcrumbs title="Classes" />

      <Dashboard.Header
        heading="Classes"
        subtitle="Create, manage, and track your classes."
      >
        <FormControl>
          <InputLabel id="filter-select-label">Filter</InputLabel>
          <Select
            labelId="filter-select-label"
            multiple
            value={filters}
            input={<OutlinedInput id="filter-select" label="Chip" />}
            onChange={onChange}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {[...courses, ...semesters, ...years].map((value) => {
              return (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Dashboard.Header>

      <Grid2 container rowSpacing={1} columnSpacing={1}>
        {groups.map((group) => {
          return (
            <Grid2 key={group.id} xs={6} md={4} lg={3}>
              <GroupCard group={group} />
            </Grid2>
          );
        })}
      </Grid2>

      <Dashboard.SpeedDial label="Classes SpeedDial" icon={<GroupIcon />}>
        <SpeedDialAction
          icon={<GroupAdd />}
          tooltipTitle="Add Class"
          onClick={() => navigate('add-group')}
        />
      </Dashboard.SpeedDial>
    </>
  );
};
