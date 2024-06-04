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
import { useStudentsCount } from 'hooks';
import { useNavigate } from 'react-router-dom';

interface GroupCardProps {
  group: Group;
}

export const GroupCard = ({ group }: GroupCardProps) => {
  const { course, semester, year } = group;
  const { count } = useStudentsCount(group.id);
  const navigate = useNavigate();
  return (
    <Card variant="outlined">
      <CardActionArea onClick={() => navigate(group.id)}>
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
              label={`${count} student${count > 1 ? 's' : ''}`}
            />
            <ArrowForward />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
