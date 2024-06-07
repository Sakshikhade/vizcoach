import { ArrowForward, Group as GroupIcon, Update } from '@mui/icons-material';
import {
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { Activity } from 'db';

interface ActivityCardProps {
  activity: Activity;
}

export const ActivityCard = ({ activity }: ActivityCardProps) => {
  const { title } = activity;
  return (
    <Card variant="outlined">
      <CardActionArea>
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '10rem',
            justifyContent: 'space-between',
          }}
        >
          <Stack>
            <Typography gutterBottom variant="h6" component="div">
              {title}
            </Typography>
            <Typography
              variant="subtitle2"
              dangerouslySetInnerHTML={{ __html: activity.description }}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: '3',
                WebkitBoxOrient: 'vertical',
              }}
            ></Typography>
          </Stack>
          <ActivityCardFooter activity={activity} />
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

interface ActivityCardFooterProps {
  activity: Activity;
}

const ActivityCardFooter = ({ activity }: ActivityCardFooterProps) => {
  const { group } = activity;
  return (
    <Stack direction="row" alignItems="center" justifyContent={'space-between'}>
      <Stack direction="row" spacing={1}>
        {activity.isScheduled && (
          <Chip
            variant="outlined"
            color="warning"
            icon={<Update />}
            label={activity.scheduled.toLocaleDateString()}
          />
        )}
        {group.valid && (
          <Chip
            variant="outlined"
            color="primary"
            icon={<GroupIcon />}
            label={group.title}
          />
        )}
      </Stack>
      <ArrowForward />
    </Stack>
  );
};
