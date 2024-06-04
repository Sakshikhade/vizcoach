import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Chip
              variant="outlined"
              color="primary"
              label={`${students.length} student${students.length > 1 ? 's' : ''}`}
            />
            <ArrowForward />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
