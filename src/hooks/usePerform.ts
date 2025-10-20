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
  const [comments, setComments] = useState(data.comments);

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

  const createOrUpdate = (state: SubmissionState) => {
    if (syncing) return;
    // Allow resubmit when changing from 'submitted' to 'draft'
    if (submission?.state === 'submitted' && state !== 'draft') return;
    setSyncing(true);

    // Build payload safely; if JSON is invalid, bail and reset syncing
    let payload: { json: object; state: SubmissionState };
    try {
      payload = {
        json: JSON.parse(json),
        state,
      };
    } catch (e) {
      console.error('Invalid JSON, cannot save/update submission.', e);
      setSyncing(false);
      return;
    }

    const promise = !submission
      ? client.createSubmission(activity.id, unit.id, payload)
      : client.updateSubmission(activity.id, unit.id, payload);

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

  const resubmit = () => createOrUpdate('draft');

  const save = () => createOrUpdate(null);

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
    return () => client.unregisterPostCommentCallback();
  }, [submission]);

  // Autosave every 30 seconds while attempting (not submitted)
  useEffect(() => {
    const interval = setInterval(() => {
      if (submission?.state === 'submitted') return;
      if (saved) return;
      createOrUpdate(null);
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission?.state, saved]);

  return {
    ...data,
    submission,
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
  };
};
