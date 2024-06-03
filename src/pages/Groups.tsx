import { useMemo, useState } from 'react';
import { Group, GroupAdd } from '@mui/icons-material';
import {
  Box,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { GroupCard } from 'components';
import { useGroups } from 'hooks';

const ALL_STUDENT_GROUPS = 'All Student Groups';

export const Groups = () => {
  const { groups, courses, semesters, years } = useGroups();
  const [selectedFilters, setSelectedFilters] = useState<(string | number)[]>([
    ALL_STUDENT_GROUPS,
  ]);

  const filteredGroups = useMemo(() => {
    if (selectedFilters.includes(ALL_STUDENT_GROUPS)) {
      return groups;
    }
    return groups.filter((group) => {
      return (
        selectedFilters.includes(group.course) ||
        selectedFilters.includes(group.semester) ||
        selectedFilters.includes(group.year)
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
    <>
      <Box
        sx={{ mt: 8, mb: 4, display: 'flex', justifyContent: 'space-between' }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Group sx={{ mr: 1 }} />
            <Typography variant="h5">Student Groups</Typography>
          </Box>
          <Typography variant="subtitle1">
            Create, Manage, and Track Student Groups.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', columnGap: 1, alignItems: 'center' }}>
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
          <IconButton color="primary" sx={{ height: 'fit-content' }}>
            <GroupAdd />
          </IconButton>
        </Box>
      </Box>
      <Grid2 container rowSpacing={1} columnSpacing={1}>
        {filteredGroups.map((group) => {
          return (
            <Grid2 key={group.id} xs={6} md={4} lg={3}>
              <GroupCard group={group} />
            </Grid2>
          );
        })}
      </Grid2>
    </>
  );
};
