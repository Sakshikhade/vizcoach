import { useLoaderData } from 'react-router-dom';
import { GetUnitResponse } from 'db';

export const useUnitLoader = () => useLoaderData() as GetUnitResponse;
