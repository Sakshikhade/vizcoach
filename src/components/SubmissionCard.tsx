import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AdjustRounded,
  ArrowForward,
  CheckCircleOutlineRounded,
  ErrorOutlineRounded,
  RadioButtonUncheckedRounded,
} from '@mui/icons-material';
import {
  Alert,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
} from '@mui/material';
import {
  AttemptingChip,
  NotAttemptedChip,
  RaisedHandChip,
  StudentHeader,
  SubmittedChip,
  Visualization,
} from 'components';
import { Dataset, Submission, Unit, User } from 'db';

const CARD_CONTENT_HEIGHT = 300;

type SubmissionCardProps = {
  student: User;
  units: Unit[];
  submissions: Submission[];
  datasets: Dataset[];
  selectedUnit?: Unit;
};

export const SubmissionCard = ({
  student,
  units,
  submissions,
  datasets,
  selectedUnit,
}: SubmissionCardProps) => {
  const navigate = useNavigate();
  const unitSubmissions = useMemo(
    () =>
      submissions.reduce((map, submission) => {
        map.set(submission.unitId, submission);
        return map;
      }, new Map<string, Submission>()),
    [submissions],
  );

  return (
    <Card variant="outlined">
      <CardActionArea onClick={() => navigate(student.id)}>
        <CardContent>
          <Stack marginBottom={2}>
            <StudentHeader student={student} />
          </Stack>
          <Stack marginY={2} height={CARD_CONTENT_HEIGHT}>
            {selectedUnit ? (
              <SelectedSubmissionContent
                datasets={datasets}
                submission={unitSubmissions.get(selectedUnit.id)}
              />
            ) : (
              <AllSubmissionsContent
                units={units}
                unitSubmissions={unitSubmissions}
              />
            )}
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            marginTop={2}
          >
            {selectedUnit ? (
              <SelectedSubmissionFooter
                submission={unitSubmissions.get(selectedUnit.id)}
              />
            ) : (
              <AllSubmissionsFooter units={units} submissions={submissions} />
            )}
            <ArrowForward />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

type SelectedSubmissionContentProps = {
  datasets: Dataset[];
  submission?: Submission;
};

const SelectedSubmissionContent = ({
  datasets,
  submission,
}: SelectedSubmissionContentProps) => {
  if (!datasets.length) {
    return (
      <Stack height="100%" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  } else if (submission) {
    const json = JSON.stringify({
      ...submission.json,
      height: CARD_CONTENT_HEIGHT,
      width: 'container',
    });
    return <Visualization datasets={datasets} json={json} />;
  } else {
    return (
      <Alert icon={<ErrorOutlineRounded />} color="error" variant="outlined">
        No submission, unable to render a visualization!
      </Alert>
    );
  }
};

type AllSubmissionsContentProps = {
  units: Unit[];
  unitSubmissions: Map<string, Submission>;
};

const AllSubmissionsContent = ({
  units,
  unitSubmissions,
}: AllSubmissionsContentProps) => {
  return (
    <List sx={{ overflowY: 'auto' }}>
      {units.map((unit) => (
        <UnitListItem
          key={unit.id}
          unit={unit}
          submission={unitSubmissions.get(unit.id)}
        />
      ))}
    </List>
  );
};

type SelectedSubmissionFooterProps = {
  submission?: Submission;
};

const SelectedSubmissionFooter = ({
  submission,
}: SelectedSubmissionFooterProps) => {
  if (!submission) {
    return <NotAttemptedChip />;
  } else if (submission.state === 'help') {
    return <RaisedHandChip />;
  } else if (submission.state === 'submitted') {
    return <SubmittedChip />;
  } else {
    return <AttemptingChip />;
  }
};

type AllSubmissionsFooterProps = {
  units: Unit[];
  submissions: Submission[];
};

const AllSubmissionsFooter = ({
  units,
  submissions,
}: AllSubmissionsFooterProps) => {
  if (!submissions.length) {
    return <NotAttemptedChip />;
  } else if (submissions.some(({ state }) => state === 'help')) {
    return <RaisedHandChip />;
  } else if (
    submissions.filter(({ state }) => state === 'submitted').length ===
    units.length
  ) {
    return <SubmittedChip />;
  } else {
    return <AttemptingChip />;
  }
};

type UnitListItemProps = {
  unit: Unit;
  submission?: Submission;
};

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

type UnitIconProps = {
  submission?: Submission;
};

const UnitIcon = ({ submission }: UnitIconProps) => {
  if (!!submission && submission.state === 'submitted') {
    return <CheckCircleOutlineRounded color="success" />;
  } else if (!!submission) {
    return <AdjustRounded color="primary" />;
  } else {
    return <RadioButtonUncheckedRounded />;
  }
};
