import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Typography,
} from '@mui/material';
import { Group } from 'db';
import { CardFooter } from './CardFooter';

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
          <Typography variant="h6">{title}</Typography>
          <CardFooter>
            <Chip
              variant="outlined"
              color="primary"
              label={`${studentsCount} student${(studentsCount || 0) > 1 ? 's' : ''}`}
            />
          </CardFooter>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
