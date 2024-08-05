import { ChangeEvent, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  FormControlLabel,
  Paper,
  SpeedDialAction,
  Stack,
  Switch,
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
import { GridExpandMoreIcon } from '@mui/x-data-grid';
import {
  Dashboard,
  DatasetTabs,
  JsonEditor,
  SubmissionChip,
  UnsavedChip,
  VegaLiteBuilder,
  Visualization,
} from 'components';
import { usePerform } from 'hooks';

enum PerformSection {
  CONFIGURATION = 'Configuration',
  ACTIVITY_DESCRIPTION = "Activity's Description",
  UNIT_DESCRIPTION = "Unit's Description",
  DATASETS = 'Datasets',
}

export const Perform = () => {
  const {
    activity,
    datasets,
    submission,
    unit,
    json,
    saved,
    updateJson,
    raiseHand,
    unraiseHand,
    submit,
    save,
  } = usePerform();
  const [error, setError] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(true);

  const onShowBuilderChange = (event: ChangeEvent<HTMLInputElement>) => {
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
        <SubmissionChip submission={submission} />
      </Dashboard.Header>

      <Stack direction="row" gap={2}>
        <Stack flex="1">
          <Paper variant="outlined">
            <Stack>
              <Visualization datasets={datasets} json={json} />
            </Stack>
          </Paper>
        </Stack>
        <Stack flex="1">
          <Accordion variant="outlined" defaultExpanded>
            <AccordionSummary
              expandIcon={<GridExpandMoreIcon />}
              aria-controls={`${PerformSection.CONFIGURATION}-content`}
              id={`${PerformSection.CONFIGURATION}-header`}
            >
              <Stack
                direction="row"
                width="100%"
                justifyContent="space-between"
              >
                <Typography>{PerformSection.CONFIGURATION}</Typography>
                {!saved && <UnsavedChip />}
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
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
              <Stack marginTop={2} alignItems="end">
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
              </Stack>
            </AccordionDetails>
          </Accordion>
          <Accordion variant="outlined">
            <AccordionSummary
              expandIcon={<GridExpandMoreIcon />}
              aria-controls={`${PerformSection.ACTIVITY_DESCRIPTION}-content`}
              id={`${PerformSection.ACTIVITY_DESCRIPTION}-header`}
            >
              <Typography>{PerformSection.ACTIVITY_DESCRIPTION}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                dangerouslySetInnerHTML={{ __html: activity.description }}
                sx={{ paddingX: 2 }}
              />
            </AccordionDetails>
          </Accordion>
          <Accordion variant="outlined">
            <AccordionSummary
              expandIcon={<GridExpandMoreIcon />}
              aria-controls={`${PerformSection.UNIT_DESCRIPTION}-content`}
              id={`${PerformSection.UNIT_DESCRIPTION}-header`}
            >
              <Typography>{PerformSection.UNIT_DESCRIPTION}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                dangerouslySetInnerHTML={{ __html: unit.description }}
                sx={{ paddingX: 2 }}
              />
            </AccordionDetails>
          </Accordion>
          <Accordion variant="outlined">
            <AccordionSummary
              expandIcon={<GridExpandMoreIcon />}
              aria-controls={`${PerformSection.DATASETS}-content`}
              id={`${PerformSection.DATASETS}-header`}
            >
              <Typography>{PerformSection.DATASETS}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <DatasetTabs datasets={datasets} />
            </AccordionDetails>
          </Accordion>
        </Stack>
      </Stack>

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
    </>
  );
};
