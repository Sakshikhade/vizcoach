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
          <Stack>
            <Typography variant="h6">{student.name}</Typography>
            <Typography variant="caption">{student.username}</Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
