import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Typography,
} from '@mui/material';
import {
  BackHandRounded,
  CheckCircleOutlineRounded,
  TaskAltRounded,
} from '@mui/icons-material';
import { GridExpandMoreIcon } from '@mui/x-data-grid';
import {
  DashboardBreadcrumbs,
  DashboardHeader,
  DashboardLayout,
  DashboardSpeedDial,
  DatasetTabs,
  JsonEditor,
  SubmissionChip,
  Visualization,
} from 'components';
import { useSubmissionLoader } from 'hooks';

enum PerformSection {
  CONFIGURATION = 'Configuration',
  ACTIVITY_DESCRIPTION = "Activity's Description",
  UNIT_DESCRIPTION = "Unit's Description",
  DATASETS = 'Datasets',
}

namespace PerformSection {
  type AccordionComponentProps = {
    section: PerformSection;
    defaultExpanded?: boolean;
  };

  export const AccordionComponent = ({
    section,
    defaultExpanded,
  }: AccordionComponentProps) => {
    return (
      <Accordion variant="outlined" defaultExpanded={defaultExpanded}>
        <AccordionSummary
          expandIcon={<GridExpandMoreIcon />}
          aria-controls={`${section}-content`}
          id={`${section}-header`}
        >
          <Typography>{section}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Details section={section} />
        </AccordionDetails>
      </Accordion>
    );
  };

  const Details = ({ section }: { section: PerformSection }) => {
    const { activity, unit, datasets, submission } = useSubmissionLoader();
    switch (section) {
      case PerformSection.CONFIGURATION:
        return <JsonEditor submission={submission} />;
      case PerformSection.ACTIVITY_DESCRIPTION:
        return (
          <Typography
            dangerouslySetInnerHTML={{ __html: activity.description }}
            sx={{ paddingX: 2 }}
          />
        );
      case PerformSection.UNIT_DESCRIPTION:
        return (
          <Typography
            dangerouslySetInnerHTML={{ __html: unit.description }}
            sx={{ paddingX: 2 }}
          />
        );
      case PerformSection.DATASETS:
        return <DatasetTabs datasets={datasets} />;
    }
  };
}

export const Perform = () => {
  return (
    <DashboardLayout
      breadcrumbs={<Breadcrumbs />}
      header={<Header />}
      content={<Content />}
      speedDial={<SpeedDial />}
    />
  );
};

const Breadcrumbs = () => {
  const { activity, unit } = useSubmissionLoader();
  return (
    <DashboardBreadcrumbs
      title={unit.title}
      links={[
        {
          href: '/dashboard/activities',
          children: 'Activities',
        },
        {
          href: `/dashboard/activities/${activity.id}/units`,
          children: activity.title,
        },
      ]}
    />
  );
};

const Header = () => {
  const { unit, submission } = useSubmissionLoader();
  return (
    <DashboardHeader
      heading={unit.title}
      subtitle="Create visualization for this unit."
      options={<SubmissionChip submission={submission} />}
    />
  );
};

const Content = () => {
  const { datasets, submission } = useSubmissionLoader();
  return (
    <Stack direction="row" gap={2} position="relative">
      <Stack flex="1">
        <Visualization datasets={datasets} submission={submission} />
      </Stack>
      <Stack flex="1">
        <PerformSection.AccordionComponent
          section={PerformSection.CONFIGURATION}
          defaultExpanded
        />
        <PerformSection.AccordionComponent
          section={PerformSection.ACTIVITY_DESCRIPTION}
        />
        <PerformSection.AccordionComponent
          section={PerformSection.UNIT_DESCRIPTION}
        />
        <PerformSection.AccordionComponent section={PerformSection.DATASETS} />
      </Stack>
    </Stack>
  );
};

const SpeedDial = () => {
  const { submission } = useSubmissionLoader();
  if (submission?.state === 'submitted') return null;
  return (
    <DashboardSpeedDial
      ariaLabel="Perform SpeedDial"
      openIcon={<TaskAltRounded />}
      actions={[
        {
          icon: <BackHandRounded />,
          tooltipTitle: 'Raise Hand',
        },
        {
          icon: <CheckCircleOutlineRounded />,
          tooltipTitle: 'Submit Unit',
        },
      ]}
    />
  );
};
