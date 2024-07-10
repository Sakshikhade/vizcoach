import { useLoaderData } from 'react-router-dom';
import { Group } from 'db';

export const useGroupsLoader = () => useLoaderData() as Group[];
