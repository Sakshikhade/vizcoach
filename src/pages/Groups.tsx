import { useEffect, useMemo, useState } from 'react';
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
} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import {
  DashboardBreadcrumbs,
  DashboardHeader,
  DashboardLayout,
  DashboardSpeedDial,
  GroupCard,
} from 'components';
import { Group } from 'db';
import { useGroupsLoader } from 'hooks';

const ALL_STUDENT_GROUPS = 'All Student Groups';

export const Groups = () => {
  const groups = useGroupsLoader();
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  return (
    <DashboardLayout
      breadcrumbs={<DashboardBreadcrumbs title="Student Groups" />}
      header={
        <GroupsHeader groups={groups} setFilteredGroups={setFilteredGroups} />
      }
      content={<GroupsContent groups={filteredGroups} />}
      speedDial={<GroupsSpeedDial />}
    />
  );
};

const GroupsHeader = (props: GroupsFilterControlProps) => {
  return (
    <DashboardHeader
      heading="Student Groups"
      subtitle="Create, manage, and track student groups."
      options={<GroupsFilterControl {...props} />}
    />
  );
};

interface GroupsFilterControlProps {
  groups: Group[];
  setFilteredGroups: (groups: Group[]) => void;
}

const GroupsFilterControl = ({
  groups,
  setFilteredGroups,
}: GroupsFilterControlProps) => {
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

  useEffect(() => {
    if (selectedFilters.includes(ALL_STUDENT_GROUPS)) {
      setFilteredGroups(groups);
    } else {
      const filteredGroups = groups.filter(({ course, semester, year }) => {
        return (
          selectedFilters.includes(course) ||
          selectedFilters.includes(semester) ||
          selectedFilters.includes(year)
        );
      });
      setFilteredGroups(filteredGroups);
    }
  }, [groups, selectedFilters, setFilteredGroups]);

  const onFilterChange = (event: SelectChangeEvent<typeof selectedFilters>) => {
    const { value } = event.target;
    let filters = typeof value === 'string' ? value.split(',') : value;
    filters = filters.filter((filter) => filter !== ALL_STUDENT_GROUPS);
    if (!filters.length) filters.push(ALL_STUDENT_GROUPS);
    setSelectedFilters(filters);
  };

  return (
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
  );
};

type GroupsContentProps = {
  groups: Group[];
};

const GroupsContent = ({ groups }: GroupsContentProps) => {
  return (
    <Grid2 container rowSpacing={1} columnSpacing={1}>
      {groups.map((group) => {
        return (
          <Grid2 key={group.id} xs={6} md={4} lg={3}>
            <GroupCard group={group} />
          </Grid2>
        );
      })}
    </Grid2>
  );
};

const GroupsSpeedDial = () => {
  return (
    <DashboardSpeedDial
      ariaLabel="Groups SpeedDial"
      openIcon={<GroupIcon />}
      actions={[
        {
          icon: <GroupAdd />,
          tooltipTitle: 'Add Student Group',
        },
      ]}
    />
  );
};
