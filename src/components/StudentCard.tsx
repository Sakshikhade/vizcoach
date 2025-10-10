import { Avatar, Card, CardContent, Stack, Typography } from '@mui/material';
import { User } from 'db';

interface StudentInfoProps {
  student: User;
}

export const StudentHeader = ({ student }: StudentInfoProps) => {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Avatar alt={student.name} src={student.avatar} />
      <Stack>
        <Typography variant="h6">{student.name}</Typography>
        <Typography variant="caption">{student.username}</Typography>
      </Stack>
    </Stack>
  );
};

export const StudentCard = ({ student }: StudentInfoProps) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <StudentHeader student={student} />
      </CardContent>
    </Card>
  );
};
