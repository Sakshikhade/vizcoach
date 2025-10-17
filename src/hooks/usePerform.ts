import { useEffect, useState } from 'react';
import client, { GetSubmissionResponse, Submission, SubmissionState } from 'db';
import { useDashboard } from 'hooks';

const DEFAULT_JSON = `{
    "autosize": {
        "resize": true,
        "type": "fit"
    },
    "height": 480,
    "width": "container"
}`;

const DEFAULT_CHARTS = [
  {
    id: 'chart-1',
    title: 'Chart 1',
    json: DEFAULT_JSON,
  },
];

const unsavedPrompt = (event: BeforeUnloadEvent) => {
  event.preventDefault();
  return 'Your progess is not saved. Do you want to continue?';
};

const getCharts = (submission: Submission | null) => {
  if (!submission) return DEFAULT_CHARTS;
  // If submission has charts array, use it; otherwise convert single json to charts format
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
};

export const usePerform = () => {
  const { useData } = useDashboard();
  const data = useData!<GetSubmissionResponse>();
  const { activity, unit } = data;

  const [submission, setSubmission] = useState(data.submission);
  const [charts, setCharts] = useState(getCharts(submission));
  const [activeChartId, setActiveChartId] = useState('chart-1');
  const [saved, setSaved] = useState(!!submission);
  const [syncing, setSyncing] = useState(false);
  const [comments, setComments] = useState(data.comments);

  const activeChart =
    charts.find((chart) => chart.id === activeChartId) || charts[0];
  const json =
    typeof activeChart?.json === 'string'
      ? activeChart.json
      : JSON.stringify(activeChart?.json || {}, null, 4);

  const updateJson = (value: string) => {
    setCharts((prev) =>
      prev.map((chart) =>
        chart.id === activeChartId ? { ...chart, json: value } : chart,
      ),
    );
    setSaved(false);
  };

  /**
   * This useEffect is expected to set the charts and saved status when submission is saved,
   * including by raising or unraising hands, we set the charts and saved indicator.
   */
  useEffect(() => {
    setCharts(getCharts(submission));
    setSaved(!!submission);
  }, [submission]);

  /**
   * This useEffect will ensure that any time submission is saved,
   * including by raising or unraising hands, we set, or unset, the onbeforeunload hook.
   */
  useEffect(() => {
    const isSaved =
      submission &&
      charts.length > 0 &&
      charts.every(
        (chart) =>
          chart.json === JSON.stringify(JSON.parse(chart.json), null, 4),
      );
    window.onbeforeunload = isSaved ? null : unsavedPrompt;
  }, [submission, charts]);

  const createOrUpdate = (state: SubmissionState) => {
    if (syncing || submission?.state === 'submitted') return;
    setSyncing(true);

    /**
     * Students can save submission even if no database record exists.
     * This check ensures to either create or update the submission.
     */
    // Convert charts to array of parsed JSON objects
    const chartsData = charts.map((chart) => ({
      id: chart.id,
      title: chart.title,
      json:
        typeof chart.json === 'string' ? JSON.parse(chart.json) : chart.json,
    }));
    const unsavedSubmission = {
      json: chartsData,
      state,
    };
    const promise = !submission
      ? client.createSubmission(activity.id, unit.id, unsavedSubmission)
      : client.updateSubmission(activity.id, unit.id, unsavedSubmission);

    promise
      .then(setSubmission)
      .catch(console.error)
      .finally(() => setSyncing(false));
  };

  const raiseHand = () => {
    if (submission?.state === 'help') return;
    createOrUpdate('help');
  };

  const unraiseHand = () => {
    if (submission?.state !== 'help') return;
    createOrUpdate(null);
  };

  const submit = () => createOrUpdate('submitted');

  const save = () => createOrUpdate(null);

  const addChart = () => {
    const newChartId = `chart-${Date.now()}`;
    const newChart = {
      id: newChartId,
      title: `Chart ${charts.length + 1}`,
      json: DEFAULT_JSON,
    };
    setCharts((prev) => [...prev, newChart]);
    setActiveChartId(newChartId);
  };

  const removeChart = (chartId: string) => {
    if (charts.length <= 1) return; // Keep at least one chart
    setCharts((prev) => prev.filter((chart) => chart.id !== chartId));
    if (activeChartId === chartId) {
      setActiveChartId(charts[0]?.id || 'chart-1');
    }
  };

  const resubmit = () => {
    if (syncing) return;
    setSyncing(true);
    const chartsData = charts.map((chart) => ({
      id: chart.id,
      title: chart.title,
      json:
        typeof chart.json === 'string' ? JSON.parse(chart.json) : chart.json,
    }));
    const unsavedSubmission = {
      json: chartsData,
      state: null,
    };
    client
      .resubmit(activity.id, unit.id, unsavedSubmission)
      .then(setSubmission)
      .catch(console.error)
      .finally(() => setSyncing(false));
  };

  const postComment = async (content: string) => {
    if (!submission) return;
    try {
      await client.postComment(submission, content);
    } catch (error) {
      console.error(error);
    }
  };

  // Setting up subscription to listen to new comments
  useEffect(() => {
    if (!submission) {
      return;
    }

    // Registering to new comment updates
    client.registerPostCommentCallback(submission, (comment) => {
      setComments((prev) => [comment, ...prev]);
    });

    // Unregistering from subscriptions
    return () => {
      try {
        client.unregisterPostCommentCallback();
      } catch (error) {
        console.warn('Failed to unsubscribe from post comment updates:', error);
      }
    };
  }, [submission]);

  // Subscribe to teacher updates on the current submission (state/score changes)
  useEffect(() => {
    if (!submission) return;
    client.registerSubmissionUpdateCallback(
      submission.id,
      activity.id,
      unit.id,
      (updated) => setSubmission(updated),
    );
    return () => {
      try {
        client.unregisterSubmissionUpdateCallback();
      } catch (error) {
        console.warn('Failed to unsubscribe from submission updates:', error);
      }
    };
  }, [submission, activity.id, unit.id]);

  return {
    ...data,
    submission,
    charts,
    activeChartId,
    json,
    saved,
    // expose attempt and score via submission getters in UI
    comments,
    updateJson,
    raiseHand,
    unraiseHand,
    submit,
    save,
    resubmit,
    addChart,
    removeChart,
    setActiveChartId,
    postComment,
  };
};
