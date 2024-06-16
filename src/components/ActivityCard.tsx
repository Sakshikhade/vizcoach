import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import {
  CardEllipsisableBody,
  CardFooter,
  GroupChip,
  ScheduledChip,
  UnitsCountChip,
} from 'components';
import { Activity, toTextContent } from 'db';

interface ActivityCardProps {
  activity: Activity;
}

export const ActivityCard = ({ activity }: ActivityCardProps) => {
  const { id, title, group, unitsCount, description, isScheduled, scheduled } =
    activity;
  const navigate = useNavigate();
  return (
    <Card variant="outlined">
      <CardActionArea onClick={() => navigate(`${id}/units`)}>
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '10rem',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" justifyContent="space-between">
            <Stack>
              <Typography gutterBottom variant="h6">
                {title}
              </Typography>
              <CardEllipsisableBody>
                {toTextContent(description)}
              </CardEllipsisableBody>
            </Stack>
            {isScheduled && <ScheduledChip scheduled={scheduled} />}
          </Stack>
          <CardFooter>
            {group.valid && <GroupChip group={group} />}
            {unitsCount > 0 && <UnitsCountChip count={unitsCount} />}
          </CardFooter>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
