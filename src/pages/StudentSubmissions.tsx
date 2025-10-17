import { useMemo, useState } from 'react';
import {
  Alert,
  Chip,
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
  Comments,
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
  const {
    activity,
    student,
    submissions,
    submission,
    setSubmission,
    getSubmissionById,
    getSubmissionUnit,
    getSubmissionDatasets,
    getSubmissionComments,
    postComment,
  } = useStudentSubmissions();

  const [submissionTab, setSubmissionTab] = useState<
    (typeof SUBMISSION_TABS)[number]
  >(SUBMISSION_TABS[0]);
  const [activeChartId, setActiveChartId] = useState<string | null>(null);

  const charts = useMemo(() => {
    if (!submission?.json) return [];
    // Handle both old format (single object) and new format (array of charts)
    if (Array.isArray(submission.json)) {
      return submission.json.map((chart: any) => ({
        ...chart,
        json:
          typeof chart.json === 'string'
            ? chart.json
            : JSON.stringify(chart.json, null, 4),
      }));
    }
    return [
      {
        id: 'chart-1',
        title: 'Chart 1',
        json:
          typeof submission.json === 'string'
            ? submission.json
            : JSON.stringify(submission.json, null, 4),
      },
    ];
  }, [submission]);

  const activeChart = useMemo(() => {
    if (!activeChartId) return charts[0];
    return charts.find((chart) => chart.id === activeChartId) || charts[0];
  }, [charts, activeChartId]);

  const json = useMemo(() => {
    if (!activeChart?.json) return '{}';
    return typeof activeChart.json === 'string'
      ? activeChart.json
      : JSON.stringify(activeChart.json, null, 4);
  }, [activeChart]);

  const unit = useMemo(
    () => (submission ? getSubmissionUnit(submission) : null),
    [submission, getSubmissionUnit],
  );

  const datasets = useMemo(
    () => (submission ? getSubmissionDatasets(submission) : []),
    [submission, getSubmissionDatasets],
  );

  const comments = useMemo(
    () => (submission ? getSubmissionComments(submission) : []),
    [submission, getSubmissionComments],
  );

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
        {submission && (
          <FormControl sx={{ width: '32rem', textOverflow: 'ellipsis' }}>
            <InputLabel id="submissions-select-label">Submission</InputLabel>
            <Select
              labelId="submissions-select-label"
              value={submission.id}
              input={<OutlinedInput id="filter-select" label="Submission" />}
              onChange={(event) =>
                setSubmission(getSubmissionById(event.target.value))
              }
            >
              {submissions.map((submission) => {
                return (
                  <MenuItem key={submission.id} value={submission.id}>
                    <Typography
                      marginRight={1}
                      sx={{ display: 'inline-block' }}
                    >
                      {unit?.title}
                    </Typography>
                    <SubmissionChip submission={submission} />
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        )}
        {submission && null}
      </Dashboard.Header>

      {!submission ? (
        <Alert variant="outlined" severity="error">
          {student.name} has not submitted any answers for this activity!
        </Alert>
      ) : (
        <>
          <Tabs
            variant="fullWidth"
            value={submissionTab}
            onChange={(_, label) => setSubmissionTab(label)}
          >
            {SUBMISSION_TABS.map((tab) => (
              <Tab key={tab} label={tab} value={tab} />
            ))}
          </Tabs>

          {submissionTab === SUBMISSION_TABS[0] && (
            <Stack gap={2}>
              {/* Chart Tabs */}
              {charts.length > 1 && (
                <Paper variant="outlined">
                  <Stack
                    direction="row"
                    alignItems="center"
                    padding={2}
                    gap={2}
                  >
                    <Typography variant="h6">Charts</Typography>
                    <Stack direction="row" gap={1} flex={1}>
                      {charts.map((chart) => (
                        <Chip
                          key={chart.id}
                          label={chart.title}
                          onClick={() => setActiveChartId(chart.id)}
                          color={
                            activeChartId === chart.id ? 'primary' : 'default'
                          }
                          variant={
                            activeChartId === chart.id ? 'filled' : 'outlined'
                          }
                        />
                      ))}
                    </Stack>
                  </Stack>
                </Paper>
              )}

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
            </Stack>
          )}

          {submissionTab === SUBMISSION_TABS[1] && (
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
                    dangerouslySetInnerHTML={{
                      __html: unit?.description || '',
                    }}
                    sx={{ paddingX: 4, paddingY: 2 }}
                  />
                </Stack>
              </Paper>
            </Stack>
          )}

          {submissionTab === SUBMISSION_TABS[2] && (
            <DatasetTabs datasets={datasets} />
          )}

          {submissionTab === SUBMISSION_TABS[3] && (
            <Comments
              comments={comments}
              onPost={(content) => {
                if (!submission) return;
                postComment(submission, content);
              }}
            />
          )}
        </>
      )}
    </>
  );
};
