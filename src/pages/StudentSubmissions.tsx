import { useMemo } from 'react';
import {
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
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

  const json = useMemo(
    () => JSON.stringify(submission?.json || {}, null, 4),
    [submission],
  );

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
      </Dashboard.Header>

      {!submission ? (
        <Alert variant="outlined" severity="error">
          {student.name} has not submitted any answers for this activity!
        </Alert>
      ) : (
        <Stack gap={3}>
          {/* Visualization Panel */}
          <Paper variant="outlined">
            <Stack>
              <Typography variant="h5" sx={{ padding: 2, paddingBottom: 1 }}>
                Visualization
              </Typography>
              <Stack direction="row" gap={2} sx={{ padding: 2, paddingTop: 0 }}>
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
          </Paper>

          {/* Descriptions Panel */}
          <Paper variant="outlined">
            <Stack>
              <Typography variant="h5" sx={{ padding: 2, paddingBottom: 1 }}>
                Descriptions
              </Typography>
              <Stack gap={2} sx={{ padding: 2, paddingTop: 0 }}>
                <Stack>
                  <Typography variant="h6" sx={{ marginBottom: 1 }}>
                    Activity's Description
                  </Typography>
                  <Paper variant="outlined">
                    <Stack>
                      <Typography
                        dangerouslySetInnerHTML={{ __html: activity.description }}
                        sx={{ paddingX: 4, paddingY: 2 }}
                      />
                    </Stack>
                  </Paper>
                </Stack>

                <Stack>
                  <Typography variant="h6" sx={{ marginBottom: 1 }}>
                    Unit's Description
                  </Typography>
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
              </Stack>
            </Stack>
          </Paper>

          {/* Datasets Panel */}
          <Paper variant="outlined">
            <Stack>
              <Typography variant="h5" sx={{ padding: 2, paddingBottom: 1 }}>
                Datasets
              </Typography>
              <Stack sx={{ padding: 2, paddingTop: 0 }}>
                <DatasetTabs datasets={datasets} />
              </Stack>
            </Stack>
          </Paper>

          {/* Comments Panel */}
          <Paper variant="outlined">
            <Stack>
              <Typography variant="h5" sx={{ padding: 2, paddingBottom: 1 }}>
                Comments
              </Typography>
              <Stack sx={{ padding: 2, paddingTop: 0 }}>
                <Comments
                  comments={comments}
                  onPost={(content) => {
                    if (!submission) return;
                    postComment(submission, content);
                  }}
                />
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      )}
    </>
  );
};
