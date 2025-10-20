import { ChangeEvent, useState } from 'react';
import {
  Alert,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  BackHandRounded,
  CheckCircleOutlineRounded,
  DoNotTouch,
  ErrorOutlineRounded,
  Save,
} from '@mui/icons-material';
import {
  Comments,
  Dashboard,
  DatasetTabs,
  ImageGallery,
  JsonEditor,
  SubmissionChip,
  UnsavedChip,
  VegaLiteBuilder,
  Visualization,
} from 'components';
import { usePerform } from 'hooks';

export const Perform = () => {
  const {
    activity,
    datasets,
    submission,
    unit,
    json,
    saved,
    comments,
    updateJson,
    raiseHand,
    unraiseHand,
    submit,
    resubmit,
    save,
    postComment,
  } = usePerform();
  const [error, setError] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(true);

  const onShowBuilderChange = (_: ChangeEvent<HTMLInputElement>) => {
    setShowBuilder((prev) => !prev);
  };

  const onJsonChange = (value: string) => {
    try {
      JSON.parse(value);
      updateJson(value);
      setError(null);
    } catch (error) {
      if (error instanceof SyntaxError) {
        setError(error.message);
      } else {
        setError('Invalid JSON!');
      }
    }
  };

  return (
    <>
      <Dashboard.Breadcrumbs title={unit.title}>
        <Dashboard.Breadcrumbs.Link href="/dashboard/activities">
          Activities
        </Dashboard.Breadcrumbs.Link>
        <Dashboard.Breadcrumbs.Link
          href={`/dashboard/activities/${activity.id}/units`}
        >
          {activity.title}
        </Dashboard.Breadcrumbs.Link>
      </Dashboard.Breadcrumbs>

      <Dashboard.Header
        heading={unit.title}
        subtitle="Create visualization for this unit."
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <SubmissionChip submission={submission} />
          {submission?.state !== 'submitted' && (
            <>
              <Tooltip title="Save Submission">
                <IconButton onClick={save} color="primary">
                  <Save />
                </IconButton>
              </Tooltip>
              {submission?.state === 'help' ? (
                <Tooltip title="Unraise Hand">
                  <IconButton onClick={unraiseHand} color="warning">
                    <DoNotTouch />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Raise Hand">
                  <IconButton onClick={raiseHand} color="info">
                    <BackHandRounded />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Submit Submission">
                <IconButton onClick={submit} color="success">
                  <CheckCircleOutlineRounded />
                </IconButton>
              </Tooltip>
            </>
          )}
          {submission?.state === 'submitted' && (
            <Tooltip title="Resubmit">
              <IconButton onClick={resubmit} color="primary">
                <CheckCircleOutlineRounded />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Dashboard.Header>

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
                  <Stack padding={2}>
                    <Stack
                      marginBottom={2}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <FormControlLabel
                        label="Show Builder"
                        labelPlacement="start"
                        control={
                          <Switch
                            checked={showBuilder}
                            onChange={onShowBuilderChange}
                          />
                        }
                      />
                      {!saved && <UnsavedChip />}
                    </Stack>
                    {showBuilder ? (
                      <VegaLiteBuilder
                        json={json}
                        datasets={datasets}
                        readOnly={submission?.state === 'submitted'}
                        onJsonChange={onJsonChange}
                      />
                    ) : (
                      <JsonEditor
                        json={json}
                        readOnly={submission?.state === 'submitted'}
                        onJsonChange={onJsonChange}
                      />
                    )}
                    {error && (
                      <Stack marginTop={2}>
                        <Alert icon={<ErrorOutlineRounded />} color="error">
                          {error}
                        </Alert>
                      </Stack>
                    )}
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
                      dangerouslySetInnerHTML={{ __html: unit.description }}
                      sx={{ paddingX: 4, paddingY: 2 }}
                    />
                  </Stack>
                </Paper>
              </Stack>

              {/* Reference Images Section */}
              {unit.reference && (
                <Stack>
                  <Typography
                    variant="h6"
                    sx={{ marginBottom: 2, fontWeight: 600 }}
                  >
                    Reference Images
                  </Typography>
                  <Paper variant="outlined" sx={{ padding: 3 }}>
                    <ImageGallery
                      record={unit}
                      imageNames={
                        Array.isArray(unit.reference)
                          ? unit.reference
                          : [unit.reference]
                      }
                      title=""
                    />
                  </Paper>
                </Stack>
              )}
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
              <Comments comments={comments} onPost={postComment} />
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </>
  );
};
