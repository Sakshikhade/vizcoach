import { useLoaderData } from 'react-router-dom';
import { GetStudentsResponse } from 'db';

export const useStudentsLoader = () => useLoaderData() as GetStudentsResponse;
