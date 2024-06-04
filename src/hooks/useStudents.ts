import { useEffect, useState } from 'react';
import { User } from 'db/types';
import client from 'db/client';

type StudentMap = {
  [key: string]: User[];
};

export const useStudents = (groupId: string) => {
  const [map, setMap] = useState<StudentMap>({});

  useEffect(() => {
    client.getStudents(groupId).then((students) => {
      setMap((prevState: StudentMap) => {
        return {
          ...prevState,
          [groupId]: students,
        };
      });
    });
  }, [groupId]);

  return {
    students: map[groupId] || [],
  };
};
