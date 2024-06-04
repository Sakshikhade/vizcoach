import { useEffect, useState } from 'react';
import { Group, User } from 'db/types';
import client from 'db/client';

type StudentMap = {
  [key: string]: User[];
};

export const useStudents = (group: Group) => {
  const [map, setMap] = useState<StudentMap>({});

  useEffect(() => {
    client.getStudents(group).then((students) => {
      setMap((prevState: StudentMap) => {
        return {
          ...prevState,
          [group.id]: students,
        };
      });
    });
  }, [group]);

  return {
    students: map[group.id] || [],
  };
};
