import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { Group } from 'db';

interface GroupCardProps {
  group: Group;
}

export const GroupCard = ({ group }: GroupCardProps) => {
  const { title, studentsCount } = group;
  const navigate = useNavigate();
  return (
    <Card variant="outlined">
      <CardActionArea onClick={() => navigate(group.id)}>
        <CardContent>
          <Typography gutterBottom variant="h6" component="div">
            {title}
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Chip
              variant="outlined"
              color="primary"
              label={`${studentsCount} student${(studentsCount || 0) > 1 ? 's' : ''}`}
            />
            <ArrowForward />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
