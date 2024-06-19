import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import {
  CardEllipsisableBody,
  CardFooter,
  DatasetChip,
  SubmissionChip,
} from 'components';
import { Submission, Unit, toTextContent } from 'db';
import { useAuth } from 'hooks';

export interface UnitCardProps {
  unit: Unit;
  submission: Submission | null;
  locked?: boolean;
}

export const UnitCard = ({ unit, submission, locked }: UnitCardProps) => {
  const { id, title, description, order, datasets } = unit;
  const { user } = useAuth();
  const navigate = useNavigate();

  const onClick = () => {
    navigate(`${id}/${user?.role === 'Teacher' ? 'view' : 'perform'}`);
  };

  return (
    <Card
      variant="outlined"
      sx={{ cursor: locked ? 'not-allowed' : 'pointer' }}
    >
      <CardActionArea disabled={locked} onClick={onClick}>
        <CardContent>
          <Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography gutterBottom variant="h6">
                Unit {order} - {title}
              </Typography>
              <SubmissionChip submission={submission} locked={locked} />
            </Stack>
            <Stack marginY={2}>
              {!locked ? (
                <CardEllipsisableBody>
                  {toTextContent(description)}
                </CardEllipsisableBody>
              ) : (
                <Alert variant="outlined" severity="warning">
                  Complete previous units to unlock this unit.
                </Alert>
              )}
            </Stack>
          </Stack>
          <CardFooter locked={locked}>
            {datasets.map(
              (dataset) =>
                !locked && <DatasetChip key={dataset} dataset={dataset} />,
            )}
          </CardFooter>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
