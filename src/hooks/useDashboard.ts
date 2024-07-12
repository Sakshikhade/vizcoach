import { useContext } from 'react';
import { DashboardContext } from 'components';

export const useDashboard = () => {
  const value = useContext(DashboardContext);
  if (!value)
    throw new Error(`Use useDashboard hook in Dashboard component only!`);
  return value;
};
