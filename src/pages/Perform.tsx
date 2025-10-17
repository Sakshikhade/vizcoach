import { ChangeEvent, useState } from 'react';
import {
  Alert,
  FormControlLabel,
  Paper,
  SpeedDialAction,
  Stack,
  Switch,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  BackHandRounded,
  CheckCircleOutlineRounded,
  DoNotTouch,
  ErrorOutlineRounded,
  Save,
  TaskAltRounded,
} from '@mui/icons-material';
import {
  Comments,
  Dashboard,
  DatasetTabs,
  JsonEditor,
  SubmissionChip,
  UnsavedChip,
  VegaLiteBuilder,
  Visualization,
} from 'components';
import { usePerform } from 'hooks';

const PERFORM_TABS = [
  'Visualization',
  'Descriptions',
  'Datasets',
  'Comments',
] as const;

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
    save,
    postComment,
    resubmit,
  } = usePerform();
  const [error, setError] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(true);
  const [performTab, setPeformTab] = useState<(typeof PERFORM_TABS)[number]>(
    PERFORM_TABS[0],
  );

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
        <Stack direction="row" gap={2} alignItems="center">
          <SubmissionChip submission={submission} />
          {submission && (
            <Typography variant="body2" color="text.secondary">
              Attempt: {submission.attempt}
            </Typography>
          )}
          {submission?.score != null && (
            <Typography variant="body2" color="text.secondary">
              Score: {submission.score}
            </Typography>
          )}
        </Stack>
      </Dashboard.Header>

      <Tabs
        variant="fullWidth"
        value={performTab}
        onChange={(_, label) => setPeformTab(label)}
      >
        {PERFORM_TABS.map((tab) => (
          <Tab
            key={tab}
            label={tab}
            value={tab}
            disabled={tab === PERFORM_TABS[3] && !submission}
          />
        ))}
      </Tabs>

      {performTab === PERFORM_TABS[0] && (
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
      )}

      {performTab === PERFORM_TABS[1] && (
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
      )}

      {performTab === PERFORM_TABS[2] && <DatasetTabs datasets={datasets} />}

      {performTab === PERFORM_TABS[3] && (
        <Comments comments={comments} onPost={postComment} />
      )}

      {submission?.state !== 'submitted' && (
        <Dashboard.SpeedDial
          label="Perform SpeedDial"
          icon={<TaskAltRounded />}
        >
          <SpeedDialAction
            icon={<Save />}
            tooltipTitle="Save Submission"
            onClick={save}
          />
          {submission?.state === 'help' ? (
            <SpeedDialAction
              icon={<DoNotTouch />}
              tooltipTitle="Unraise Hand"
              onClick={unraiseHand}
            />
          ) : (
            <SpeedDialAction
              icon={<BackHandRounded />}
              tooltipTitle="Raise Hand"
              onClick={raiseHand}
            />
          )}
          <SpeedDialAction
            icon={<CheckCircleOutlineRounded />}
            tooltipTitle="Submit Submission"
            onClick={submit}
          />
        </Dashboard.SpeedDial>
      )}

      {submission?.state === 'submitted' && (
        <Dashboard.SpeedDial
          label="Resubmit"
          icon={<TaskAltRounded />}
        >
          <SpeedDialAction
            icon={<CheckCircleOutlineRounded />}
            tooltipTitle={"Resubmit (new attempt)"}
            onClick={resubmit}
          />
        </Dashboard.SpeedDial>
      )}
    </>
  );
};
