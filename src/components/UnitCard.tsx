import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { TableRowsRounded } from '@mui/icons-material';
import { CardEllipsisableBody, CardFooter } from 'components';
import { Unit, toTextContent } from 'db';

export interface UnitCardProps {
  unit: Unit;
}

export const UnitCard = ({ unit }: UnitCardProps) => {
  const { id, title, description, order, datasets } = unit;
  const navigate = useNavigate();
  return (
    <Card variant="outlined">
      <CardActionArea onClick={() => navigate(`${id}`)}>
        <CardContent>
          <Stack>
            <Typography gutterBottom variant="h6">
              Unit {order} - {title}
            </Typography>
            <CardEllipsisableBody>
              {toTextContent(description)}
            </CardEllipsisableBody>
          </Stack>
          <CardFooter>
            {datasets.map((dataset) => {
              return (
                <Chip
                  key={dataset}
                  variant="outlined"
                  label={dataset}
                  icon={<TableRowsRounded />}
                />
              );
            })}
          </CardFooter>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
