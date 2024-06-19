import { useLoaderData } from 'react-router-dom';
import { GetSubmissionResponse } from 'db';

export const useSubmissionLoader = () =>
  useLoaderData() as GetSubmissionResponse;
