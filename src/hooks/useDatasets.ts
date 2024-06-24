import { useEffect, useState } from 'react';
import client, { Dataset, Unit } from 'db';

type State = {
  [unitId: string]: Dataset[];
};

export const useDatasets = (unit?: Unit) => {
  const [state, setState] = useState<State>({});

  useEffect(() => {
    if (!unit || state[unit.id]) return;
    client.getDatasets(unit).then((datasets) => {
      setState((prevState) => ({ ...prevState, [unit.id]: datasets }));
    });
  }, [state, unit]);

  return unit && state[unit.id] ? state[unit.id] : [];
};
