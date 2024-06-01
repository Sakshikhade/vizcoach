import { useEffect, useState } from 'react';
import { Container, List } from '@mui/material';
import { StudentGroup } from 'db/types';
import client from 'db/client';

export const Dashboard = () => {
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([]);

  useEffect(() => {
    client.getStudentGroups().then((groups: StudentGroup[]) => {
      setStudentGroups(groups);
    });
  }, []);

  return (
    <Container maxWidth="sm">
      {studentGroups.map((group) => {
        return <List key={group.id}>{group.name}</List>;
      })}
    </Container>
  );
};

export default Dashboard;
