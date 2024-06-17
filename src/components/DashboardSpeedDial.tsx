import { ReactNode, useState } from 'react';
import {
  Backdrop,
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
  const [open, setOpen] = useState(false);
  return (
    <>
      <Backdrop open={open} />
      <SpeedDial
        ariaLabel={ariaLabel}
        sx={{ position: 'fixed', bottom: '2rem', right: '2rem' }}
        icon={<SpeedDialIcon openIcon={openIcon} />}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
      >
        {actions.map((action, i) => {
          return <SpeedDialAction key={i} {...action} />;
        })}
      </SpeedDial>
    </>
  );
};
