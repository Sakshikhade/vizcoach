import { useLoaderData } from 'react-router-dom';
import { GetSubmissionsResponse } from 'db';

export const useSubmissionsLoader = () =>
  useLoaderData() as GetSubmissionsResponse;
