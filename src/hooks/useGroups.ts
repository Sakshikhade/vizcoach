import { useEffect, useMemo, useState } from 'react';
import { Group } from 'db/types';
import client from 'db/client';

export const useGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    client.getGroups().then((groups) => {
      setGroups(groups);
    });
  }, []);

  const courses = useMemo(
    () => [...new Set(groups.map(({ course }) => course))],
    [groups],
  );
  const semesters = useMemo(
    () => [...new Set(groups.map(({ semester }) => semester))],
    [groups],
  );
  const years = useMemo(
    () => [...new Set(groups.map(({ year }) => year))],
    [groups],
  );

  return {
    groups,
    courses,
    semesters,
    years,
  };
};
