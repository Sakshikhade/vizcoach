import { useNavigate } from 'react-router-dom';
import { ChecklistRounded, GroupRounded, Update } from '@mui/icons-material';
import {
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { CardEllipsisableBody, CardFooter } from 'components';
import { Activity, toTextContent } from 'db';
import { useAuth } from 'hooks';

interface ActivityCardProps {
  activity: Activity;
}

export const ActivityCard = ({ activity }: ActivityCardProps) => {
  const { id, title, group, unitsCount, description, isScheduled, scheduled } =
    activity;
  const { user } = useAuth();
  const navigate = useNavigate();

  const onClick = () => {
    if (user?.role === 'Teacher') {
      navigate(`${id}/units`);
    }
  };

  return (
    <Card variant="outlined">
      <CardActionArea onClick={onClick}>
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
            {isScheduled && (
              <Chip
                variant="outlined"
                color="warning"
                icon={<Update />}
                label={scheduled.toLocaleDateString()}
              />
            )}
          </Stack>
          <CardFooter>
            {group.valid && (
              <Chip
                variant="outlined"
                icon={<GroupRounded />}
                label={group.title}
              />
            )}
            {unitsCount > 0 && (
              <Chip
                variant="outlined"
                icon={<ChecklistRounded />}
                label={`${unitsCount} Unit${unitsCount > 1 ? 's' : ''}`}
              />
            )}
          </CardFooter>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
