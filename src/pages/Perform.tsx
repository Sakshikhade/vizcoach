import { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Paper,
  SpeedDialAction,
  Stack,
  Typography,
} from '@mui/material';
import {
  BackHandRounded,
  CheckCircleOutlineRounded,
  ErrorOutlineRounded,
  TaskAltRounded,
} from '@mui/icons-material';
import { GridExpandMoreIcon } from '@mui/x-data-grid';
import {
  Dashboard,
  DatasetTabs,
  JsonEditor,
  SubmissionChip,
  Visualization,
} from 'components';
import { GetSubmissionResponse } from 'db';
import { useDashboard } from 'hooks';

enum PerformSection {
  CONFIGURATION = 'Configuration',
  ACTIVITY_DESCRIPTION = "Activity's Description",
  UNIT_DESCRIPTION = "Unit's Description",
  DATASETS = 'Datasets',
}

export const Perform = () => {
  const { useData } = useDashboard();
  const { activity, unit, submission } = useData!<GetSubmissionResponse>();
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

      <Content />

      {submission?.state !== 'submitted' && (
        <Dashboard.SpeedDial
          label="Perform SpeedDial"
          icon={<TaskAltRounded />}
        >
          <SpeedDialAction
            icon={<BackHandRounded />}
            tooltipTitle="Raise Hand"
          />
          <SpeedDialAction
            icon={<CheckCircleOutlineRounded />}
            tooltipTitle="Submit Unit"
          />
        </Dashboard.SpeedDial>
      )}
    </>
  );
};

const Content = () => {
  const { useData } = useDashboard();
  const { activity, datasets, unit, submission } =
    useData!<GetSubmissionResponse>();
  const [json, setJson] = useState<string>(
    submission?.json ? JSON.stringify(submission.json, null, 4) : '{}',
  );
  const [error, setError] = useState<string | null>(null);

  const onJsonChange = (value: string) => {
    try {
      JSON.parse(value);
      setJson(value);
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
            <Typography>{PerformSection.CONFIGURATION}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <JsonEditor
              json={json}
              readOnly={submission?.state === 'submitted'}
              onJsonChange={onJsonChange}
            />
            {error && (
              <Stack marginTop={2}>
                <Alert icon={<ErrorOutlineRounded />} color="error">
                  {error}
                </Alert>
              </Stack>
            )}
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
  );
};
