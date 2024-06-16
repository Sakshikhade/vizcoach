import { Chip } from '@mui/material';
import {
  AdjustRounded,
  BackHandRounded,
  CheckCircleOutlineRounded,
  ChecklistRounded,
  ErrorOutlineRounded,
  GroupRounded,
  TableRowsRounded,
  Update,
} from '@mui/icons-material';
import { Group, Submission } from 'db';
import { useAuth } from 'hooks';

export const AttemptingChip = () => {
  return (
    <Chip
      variant="outlined"
      label="Attempting"
      color="primary"
      icon={<AdjustRounded />}
    />
  );
};

export const NotAttemptedChip = () => {
  return (
    <Chip
      variant="outlined"
      label="Not Attempted"
      color="error"
      icon={<ErrorOutlineRounded />}
    />
  );
};

export const SubmittedChip = () => {
  return (
    <Chip
      variant="outlined"
      label="Submitted"
      color="success"
      icon={<CheckCircleOutlineRounded />}
    />
  );
};

export const RaisedHandChip = () => {
  return (
    <Chip
      variant="outlined"
      label="Raised Hand"
      color="warning"
      icon={<BackHandRounded />}
    />
  );
};

type ScheduledChipProps = {
  scheduled: Date;
};

export const ScheduledChip = ({ scheduled }: ScheduledChipProps) => {
  return (
    <Chip
      variant="outlined"
      color="warning"
      icon={<Update />}
      label={scheduled.toLocaleDateString()}
    />
  );
};

type GroupChipProps = {
  group: Group;
};

export const GroupChip = ({ group: { title } }: GroupChipProps) => {
  return <Chip variant="outlined" icon={<GroupRounded />} label={title} />;
};

type CountChipProps = {
  count: number;
};

export const UnitsCountChip = ({ count }: CountChipProps) => {
  return (
    <Chip
      variant="outlined"
      icon={<ChecklistRounded />}
      label={`${count} Unit${count > 1 ? 's' : ''}`}
    />
  );
};

export const StudentsCountChip = ({ count }: CountChipProps) => {
  return (
    <Chip
      variant="outlined"
      color="primary"
      icon={<GroupRounded />}
      label={`${count} student${(count || 0) > 1 ? 's' : ''}`}
    />
  );
};

type DatasetChipProps = {
  dataset: string;
};

export const DatasetChip = ({ dataset }: DatasetChipProps) => {
  return (
    <Chip
      key={dataset}
      variant="outlined"
      label={dataset}
      icon={<TableRowsRounded />}
    />
  );
};

type SubmissionChipProps = {
  submission?: Submission;
  locked?: boolean;
};

export const SubmissionChip = ({ submission, locked }: SubmissionChipProps) => {
  const { user } = useAuth();
  if (user?.role === 'Teacher' || locked) {
    return null;
  } else if (!submission) {
    return <NotAttemptedChip />;
  } else if (submission.state === 'help') {
    return <RaisedHandChip />;
  } else if (submission.state === 'submitted') {
    return <SubmittedChip />;
  } else {
    return <AttemptingChip />;
  }
};
