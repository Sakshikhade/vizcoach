import {
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { Group } from 'db/types';
import { useStudents } from 'hooks';

interface GroupCardProps {
  group: Group;
}

export const GroupCard = ({ group }: GroupCardProps) => {
  const { course, semester, year } = group;
  const { students } = useStudents(group);
  return (
    <Card variant="outlined">
      <CardActionArea>
        <CardContent>
          <Typography gutterBottom variant="h6" component="div">
            {`${course}-${semester}-${year}`}
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Chip
              variant="outlined"
              color="primary"
              label={`${students.length} student${students.length > 1 ? 's' : ''}`}
            />
            <ArrowForward />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
