import { DataGrid } from '@mui/x-data-grid';
import { Dataset } from 'db';

type DatasetTableProps = {
  dataset: Dataset;
};

export const DatasetTable = ({
  dataset: { rows, fields },
}: DatasetTableProps) => {
  return (
    <DataGrid
      rows={rows}
      columns={fields}
      initialState={{
        pagination: {
          paginationModel: { page: 0, pageSize: 5 },
        },
      }}
      pageSizeOptions={[5, 10, 20]}
    />
  );
};
