import { ReactNode } from 'react';
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialActionProps,
  SpeedDialIcon,
} from '@mui/material';

interface DashboardSpeedDialProps {
  ariaLabel: string;
  openIcon: ReactNode;
  actions: SpeedDialActionProps[];
}

export const DashboardSpeedDial = ({
  ariaLabel,
  openIcon,
  actions,
}: DashboardSpeedDialProps) => {
  return (
    <SpeedDial
      ariaLabel={ariaLabel}
      sx={{ position: 'absolute', bottom: '2rem', right: '2rem' }}
      icon={<SpeedDialIcon openIcon={openIcon} />}
    >
      {actions.map((action, i) => {
        return <SpeedDialAction key={i} {...action} />;
      })}
    </SpeedDial>
  );
};
