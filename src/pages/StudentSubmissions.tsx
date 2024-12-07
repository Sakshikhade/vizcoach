import { useState } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  Dashboard,
  DatasetTabs,
  JsonEditor,
  SubmissionChip,
  Visualization,
} from 'components';
import { useStudentSubmissions } from 'hooks';

const SUBMISSION_TABS = [
  'Visualization',
  'Descriptions',
  'Datasets',
  'Comments',
] as const;

export const StudentSubmissions = () => {
  const { activity, student, submissions, getSubmissionUnit } =
    useStudentSubmissions();
  const [submissionId, setSubmissionId] = useState<string>(
    submissions[submissions.length - 1].id,
  );
  const [submissionTab, setSubmissionTab] = useState<
    (typeof SUBMISSION_TABS)[number]
  >(SUBMISSION_TABS[0]);

  return (
    <>
      <Dashboard.Breadcrumbs title={student.name}>
        <Dashboard.Breadcrumbs.Link href="/dashboard/activities">
          Activities
        </Dashboard.Breadcrumbs.Link>
        <Dashboard.Breadcrumbs.Link
          href={`/dashboard/activities/${activity.id}/units`}
        >
          {activity.title}
        </Dashboard.Breadcrumbs.Link>
        <Dashboard.Breadcrumbs.Link
          href={`/dashboard/activities/${activity.id}/submissions`}
        >
          Submissions
        </Dashboard.Breadcrumbs.Link>
      </Dashboard.Breadcrumbs>

      <Dashboard.Header
        heading={`${student.name}'s Submissions`}
        subtitle={`View ${student.name}'s submissions for ${activity.title}`}
      >
        <FormControl sx={{ width: '32rem', textOverflow: 'ellipsis' }}>
          <InputLabel id="submissions-select-label">Submission</InputLabel>
          <Select
            labelId="submissions-select-label"
            value={submissionId}
            input={<OutlinedInput id="filter-select" label="Submission" />}
            onChange={(event) => setSubmissionId(event.target.value)}
          >
            {submissions.map((submission) => {
              return (
                <MenuItem key={submission.id} value={submission.id}>
                  <Typography marginRight={1} sx={{ display: 'inline-block' }}>
                    {getSubmissionUnit(submission).title}
                  </Typography>
                  <SubmissionChip submission={submission} />
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Dashboard.Header>

      <Tabs
        variant="fullWidth"
        value={submissionTab}
        onChange={(_, label) => setSubmissionTab(label)}
      >
        {SUBMISSION_TABS.map((label) => (
          <Tab key={label} label={label} value={label} />
        ))}
      </Tabs>

      <SubmissionTab tab={submissionTab} submissionId={submissionId} />
    </>
  );
};

type SubmissionTabProps = {
  tab: (typeof SUBMISSION_TABS)[number];
  submissionId: string;
};

const SubmissionTab = (props: SubmissionTabProps) => {
  const { tab } = props;
  switch (tab) {
    case SUBMISSION_TABS[0]:
      return <VisualizationSubmissionTab {...props} />;
    case SUBMISSION_TABS[1]:
      return <DescriptionsSubmissionTab {...props} />;
    case SUBMISSION_TABS[2]:
      return <DatasetsSubmissionTab {...props} />;
    default:
      console.warn(`Unknown tab: ${tab}`);
      return null;
  }
};

const VisualizationSubmissionTab = ({ submissionId }: SubmissionTabProps) => {
  const { getSubmissionDatasets, getSubmissionById } = useStudentSubmissions();
  const submission = getSubmissionById(submissionId);
  const datasets = getSubmissionDatasets(submission);
  const json = JSON.stringify(submission.json || {}, null, 4);
  return (
    <Stack direction="row" gap={2}>
      <Stack flex={1}>
        <Paper variant="outlined">
          <Stack>
            <Visualization datasets={datasets} json={json} />
          </Stack>
        </Paper>
      </Stack>
      <Stack flex={1}>
        <Paper variant="outlined">
          <Stack>
            <JsonEditor json={json} readOnly={true} />
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  );
};

const DescriptionsSubmissionTab = ({ submissionId }: SubmissionTabProps) => {
  const { activity, getSubmissionById, getSubmissionUnit } =
    useStudentSubmissions();
  const submission = getSubmissionById(submissionId);
  const unit = getSubmissionUnit(submission);
  return (
    <Stack gap={2}>
      <Typography variant="h5">Activity's Description</Typography>
      <Paper variant="outlined">
        <Stack>
          <Typography
            dangerouslySetInnerHTML={{ __html: activity.description }}
            sx={{ paddingX: 4, paddingY: 2 }}
          />
        </Stack>
      </Paper>

      <Typography variant="h5">Unit's Description</Typography>
      <Paper variant="outlined">
        <Stack>
          <Typography
            dangerouslySetInnerHTML={{ __html: unit.description }}
            sx={{ paddingX: 4, paddingY: 2 }}
          />
        </Stack>
      </Paper>
    </Stack>
  );
};

const DatasetsSubmissionTab = ({ submissionId }: SubmissionTabProps) => {
  const { getSubmissionDatasets, getSubmissionById } = useStudentSubmissions();
  const submission = getSubmissionById(submissionId);
  const datasets = getSubmissionDatasets(submission);
  return <DatasetTabs datasets={datasets} />;
};
