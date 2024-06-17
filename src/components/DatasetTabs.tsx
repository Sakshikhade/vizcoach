import { useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import { DatasetTable } from 'components';
import { Dataset } from 'db';

type DatasetTabsProps = {
  datasets: Dataset[];
};

export const DatasetTabs = ({ datasets }: DatasetTabsProps) => {
  const [index, setIndex] = useState(0);
  return (
    <>
      <Tabs
        value={index}
        onChange={(_, index) => setIndex(index)}
        aria-label="Datasets Tabs"
      >
        {datasets.map((dataset, index) => (
          <Tab key={dataset.name} label={dataset.name} value={index} />
        ))}
      </Tabs>
      <DatasetTable dataset={datasets[index]} />
    </>
  );
};
