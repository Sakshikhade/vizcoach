import { Avatar, Card, CardContent, Stack, Typography } from '@mui/material';
import { User } from 'db';

interface StudentCardProps {
  student: User;
}

export const StudentCard = ({ student }: StudentCardProps) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar alt={student.name} src={student.avatar} />
          <Typography variant="h6" component="div">
            {student.name}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};
