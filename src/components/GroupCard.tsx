import { useNavigate } from 'react-router-dom';
import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { CardFooter, StudentsCountChip } from 'components';
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
          <Typography variant="h6">{title}</Typography>
          <CardFooter>
            <StudentsCountChip count={studentsCount} />
          </CardFooter>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
