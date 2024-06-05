import { useMemo, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import {
  Group as GroupIcon,
  GroupAdd,
  Home,
  NavigateNext,
} from '@mui/icons-material';
import {
  Box,
  Breadcrumbs,
  Chip,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
  Typography,
} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { GroupCard } from 'components';
import { Group } from 'db';

const ALL_STUDENT_GROUPS = 'All Student Groups';

export const Groups = () => {
  const groups = useLoaderData() as Group[];

  const courses = useMemo(
    () => [...new Set(groups.map(({ course }) => course))],
    [groups],
  );
  const semesters = useMemo(
    () => [...new Set(groups.map(({ semester }) => semester))],
    [groups],
  );
  const years = useMemo(
    () => [...new Set(groups.map(({ year }) => year))],
    [groups],
  );

  const [selectedFilters, setSelectedFilters] = useState<(string | number)[]>([
    ALL_STUDENT_GROUPS,
  ]);

  const filteredGroups = useMemo(() => {
    if (selectedFilters.includes(ALL_STUDENT_GROUPS)) {
      return groups;
    }
    return groups.filter(({ course, semester, year }) => {
      return (
        selectedFilters.includes(course) ||
        selectedFilters.includes(semester) ||
        selectedFilters.includes(year)
      );
    });
  }, [selectedFilters, groups]);

  const onFilterChange = (event: SelectChangeEvent<typeof selectedFilters>) => {
    const { value } = event.target;
    let filters = typeof value === 'string' ? value.split(',') : value;
    filters = filters.filter((filter) => filter !== ALL_STUDENT_GROUPS);
    if (!filters.length) filters.push(ALL_STUDENT_GROUPS);
    setSelectedFilters(filters);
  };

  return (
    <Stack spacing={4} marginY={4}>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
        <Link
          underline="none"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Home fontSize="inherit" />
        </Link>
        <Typography color="text.primary">Student Groups</Typography>
      </Breadcrumbs>
      <Stack direction="row" justifyContent="space-between">
        <Stack>
          <Typography variant="h5">Student Groups</Typography>
          <Typography variant="subtitle1">
            Create, Manage, and Track Student Groups.
          </Typography>
        </Stack>
        <FormControl>
          <InputLabel id="filter-select-label">Filter</InputLabel>
          <Select
            labelId="filter-select-label"
            multiple
            value={selectedFilters}
            input={<OutlinedInput id="filter-select" label="Chip" />}
            onChange={onFilterChange}
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
      </Stack>
      <Grid2 container rowSpacing={1} columnSpacing={1}>
        {filteredGroups.map((group) => {
          return (
            <Grid2 key={group.id} xs={6} md={4} lg={3}>
              <GroupCard group={group} />
            </Grid2>
          );
        })}
      </Grid2>
      <SpeedDial
        ariaLabel="Groups SpeedDial"
        sx={{ position: 'absolute', bottom: '2rem', right: '2rem' }}
        icon={<SpeedDialIcon openIcon={<GroupIcon />} />}
      >
        <SpeedDialAction
          key={1}
          icon={<GroupAdd />}
          tooltipTitle="Add Student Group"
        />
      </SpeedDial>
    </Stack>
  );
};
