import { useEffect, useState } from 'react';
import client, { GetSubmissionResponse, Submission } from 'db';
import { useDashboard } from 'hooks';

const DEFAULT_JSON = `{
    "autosize": {
        "resize": true,
        "type": "fit"
    },
    "data": {
        "name": "1.csv"
    },
    "height": 480,
    "width": "container"
}`;

const unsavedPrompt = (event: BeforeUnloadEvent) => {
  event.preventDefault();
  return 'Your progess is not saved. Do you want to continue?';
};

const getJson = (submission: Submission | null) => {
  if (!submission) return DEFAULT_JSON;
  return JSON.stringify(submission.json, null, 4);
};

export const usePerform = () => {
  const { useData } = useDashboard();
  const data = useData!<GetSubmissionResponse>();
  const { activity, unit } = data;

  const [submission, setSubmission] = useState(data.submission);
  const [json, setJson] = useState(getJson(submission));
  const [saved, setSaved] = useState(!!submission);
  const [syncing, setSyncing] = useState(false);

  const updateJson = (value: string) => {
    setJson(value);
    setSaved(!!submission && value === getJson(submission));
  };

  /**
   * This useEffect is expected to set the JSON and saved statues when submission is saved,
   * including by raising or unraising hands, we set the JSON and saved indicator.
   */
  useEffect(() => {
    setJson(getJson(submission));
    setSaved(!!submission);
  }, [submission]);

  /**
   * This useEffect will unsure that any time submission is saved,
   * including by raising or unraising hands, we set, or unset, the onneforeunload hook.
   */
  useEffect(() => {
    window.onbeforeunload = json === getJson(submission) ? null : unsavedPrompt;
  }, [submission, json]);

  const raiseHand = () => {
    if (syncing || submission?.state === 'help') return;
    setSyncing(true);

    /**
     * Students can raise hands even if no submission record exists.
     * This check ensures to either create or update the submission.
     */
    const promise = !submission
      ? client.createSubmission(activity.id, unit.id, {
          json: JSON.parse(DEFAULT_JSON),
          state: 'help',
        })
      : client.updateSubmission(activity.id, unit.id, {
          json: JSON.parse(json),
          state: 'help',
        });
    promise
      .then(setSubmission)
      .catch(console.error)
      .finally(() => setSyncing(false));
  };

  const unraiseHand = () => {
    if (syncing || submission?.state !== 'help') return;
    setSyncing(true);

    /**
     * Students can only unraise their hands if a submission record exists,
     * so no need to create a submission.
     */
    client
      .updateSubmission(activity.id, unit.id, {
        json: JSON.parse(json),
        state: null,
      })
      .then(setSubmission)
      .catch(console.error)
      .finally(() => setSyncing(false));
  };

  return {
    ...data,
    submission,
    json,
    saved,
    updateJson,
    raiseHand,
    unraiseHand,
  };
};
