import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
} from '@mui/material';
import { CardFooter, StudentsCountChip } from 'components';
import { Group } from 'db';
import { School, CalendarToday } from '@mui/icons-material';

interface GroupCardProps {
  group: Group;
}

export const GroupCard = ({ group }: GroupCardProps) => {
  const { title, course, semester, year, studentsCount } = group;
  const navigate = useNavigate();

  const getSemesterGradient = (semester: string) => {
    const s = semester.toLowerCase();
    if (s.includes('spring')) return 'linear-gradient(90deg, #2563eb, #60a5fa)'; // Blue
    if (s.includes('fall')) return 'linear-gradient(90deg, #ea580c, #fb923c)'; // Orange
    if (s.includes('summer')) return 'linear-gradient(90deg, #dc2626, #f87171)'; // Red
    return 'linear-gradient(90deg, #64748b, #94a3b8)'; // Default slate
  };

  return (
    <Card variant="outlined" sx={{ position: 'relative', overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          background: getSemesterGradient(semester),
        }}
      />
      <CardActionArea
        onClick={() => navigate(group.id)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          height: '100%',
        }}
      >
        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pt: 3,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <School color="primary" fontSize="small" />
              {title}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              sx={{ mt: 1 }}
            >
              <Chip
                label={course}
                size="small"
                variant="outlined"
                color="primary"
              />
              <Chip
                label={`${semester} ${year}`}
                size="small"
                icon={<CalendarToday fontSize="small" />}
                sx={{ backgroundColor: 'action.hover' }}
              />
            </Stack>
          </Box>
          <Box sx={{ mt: 'auto' }}>
            <CardFooter>
              <StudentsCountChip count={studentsCount} />
            </CardFooter>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
