import { useEffect, useState } from 'react';
import client from 'db/client';

type CountMap = {
  [key: string]: number;
};

export const useStudentsCount = (groupId: string) => {
  const [map, setMap] = useState<CountMap>({});

  useEffect(() => {
    client.getStudentsCount(groupId).then((students) => {
      setMap((prevState: CountMap) => {
        return {
          ...prevState,
          [groupId]: students,
        };
      });
    });
  }, [groupId]);

  return {
    count: map[groupId],
  };
};
