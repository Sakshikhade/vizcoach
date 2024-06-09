import { useMemo } from 'react';
import {
  AdjustRounded,
  ArrowForward,
  BackHandRounded,
  CheckCircleOutlineRounded,
  ErrorOutlineRounded,
  RadioButtonUncheckedRounded,
} from '@mui/icons-material';
import {
  Card,
  CardActionArea,
  CardContent,
  Chip,
  ChipProps,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
} from '@mui/material';
import { Submission, Unit, User } from 'db';
import { StudentHeader } from './StudentCard';

interface SubmissionCardProps {
  student: User;
  units: Unit[];
  submissions: Submission[];
}

export const SubmissionCard = ({
  student,
  units,
  submissions,
}: SubmissionCardProps) => {
  const unitSubmissions = useMemo(
    () =>
      submissions.reduce((map, submission) => {
        const { unit } = submission;
        map.set(unit.id, submission);
        return map;
      }, new Map<string, Submission>()),
    [submissions],
  );

  return (
    <Card variant="outlined">
      <CardActionArea>
        <CardContent>
          <Stack marginBottom={2}>
            <StudentHeader student={student} />
          </Stack>
          <Divider />
          <List>
            {units.map((unit) => (
              <UnitListItem
                key={unit.id}
                unit={unit}
                submission={unitSubmissions.get(unit.id)}
              />
            ))}
          </List>
          <Divider />
          <SubmissionCardFooter units={units} submissions={submissions} />
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

interface SubmissionCardFooterProps {
  units: Unit[];
  submissions: Submission[];
}

const SubmissionCardFooter = ({
  units,
  submissions,
}: SubmissionCardFooterProps) => {
  const props: ChipProps = useMemo(() => {
    if (!submissions.length) {
      return {
        label: 'Not Attempted',
        color: 'error',
        icon: <ErrorOutlineRounded />,
      };
    } else if (submissions.some(({ state }) => state === 'help')) {
      return {
        label: 'Raised Hand',
        color: 'warning',
        icon: <BackHandRounded />,
      };
    } else if (
      submissions.filter(({ state }) => state === 'submitted').length ===
      units.length
    ) {
      return {
        label: 'Submitted',
        color: 'success',
        icon: <CheckCircleOutlineRounded />,
      };
    } else {
      return {
        label: 'Attempting',
        color: 'primary',
        icon: <AdjustRounded />,
      };
    }
  }, [units, submissions]);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={1}
      marginTop={2}
    >
      <Chip variant="outlined" {...props} />
      <ArrowForward />
    </Stack>
  );
};

interface UnitListItemProps {
  unit: Unit;
  submission?: Submission;
}

const UnitListItem = ({ unit, submission }: UnitListItemProps) => {
  return (
    <ListItem>
      <ListItemAvatar>
        <UnitIcon submission={submission} />
      </ListItemAvatar>
      <ListItemText
        primary={`Unit ${unit.order}: ${unit.title}`}
        secondary={
          !submission
            ? 'Not started'
            : `Last updated on ${submission.updated.toLocaleString()}`
        }
      />
    </ListItem>
  );
};

interface UnitIconProps {
  submission?: Submission;
}

const UnitIcon = ({ submission }: UnitIconProps) => {
  if (!!submission && submission.state === 'submitted') {
    return <CheckCircleOutlineRounded color="success" />;
  } else if (!!submission) {
    return <AdjustRounded color="primary" />;
  } else {
    return <RadioButtonUncheckedRounded />;
  }
};
