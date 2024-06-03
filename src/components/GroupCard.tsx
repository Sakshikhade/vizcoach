import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { Group } from 'db/types';

interface GroupCardProps {
  group: Group;
}

export const GroupCard = ({ group }: GroupCardProps) => {
  const { course, semester, year } = group;
  return (
    <Card variant="outlined">
      <CardActionArea>
        <CardContent
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" component="div">
            {`${course}-${semester}-${year}`}
          </Typography>
          <ArrowForward />
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
