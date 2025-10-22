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
  const [context, setContext] = useState(submission?.context || '');
  const [saved, setSaved] = useState(!!submission);
  const [syncing, setSyncing] = useState(false);
  const [comments, setComments] = useState(data.comments);

  const updateJson = (value: string) => {
    setJson(value);
    setSaved(!!submission && value === getJson(submission));
  };

  const updateContext = (value: string) => {
    setContext(value);
    setSaved(!!submission && value === (submission?.context || ''));
  };

  /**
   * This useEffect is expected to set the JSON and saved statues when submission is saved,
   * including by raising or unraising hands, we set the JSON and saved indicator.
   */
  useEffect(() => {
    setJson(getJson(submission));
    setContext(submission?.context || '');
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
    console.log(
      'createOrUpdate called with state:',
      state,
      'syncing:',
      syncing,
    );
    if (syncing) {
      console.log('Already syncing, returning early');
      return;
    }
    // Allow resubmit when changing from 'submitted' to null (draft state)
    if (submission?.state === 'submitted' && state !== null) {
      console.log('Submission is submitted and not resubmit, returning early');
      return;
    }
    setSyncing(true);
    console.log('Starting sync...');

    // Build payload safely; if JSON is invalid, bail and reset syncing
    let payload: { json: object; state: SubmissionState; context: string };
    try {
      payload = {
        json: JSON.parse(json),
        state,
        context,
      };
      console.log('JSON parsed successfully, payload:', payload);
    } catch (e) {
      console.error('Invalid JSON, cannot save/update submission.', e);
      setSyncing(false);
      return;
    }

    const promise = !submission
      ? client.createSubmission(activity.id, unit.id, payload)
      : client.updateSubmission(activity.id, unit.id, payload);

    console.log('Calling client method, submission exists:', !!submission);
    promise
      .then((result) => {
        console.log('Submission updated successfully:', result);
        setSubmission(result);
      })
      .catch((error) => {
        console.error('Error updating submission:', error);
      })
      .finally(() => {
        console.log('Sync completed, setting syncing to false');
        setSyncing(false);
      });
  };

  const raiseHand = () => {
    console.log('raiseHand clicked, submission state:', submission?.state);
    if (submission?.state === 'help') return;
    createOrUpdate('help');
  };

  const unraiseHand = () => {
    console.log('unraiseHand clicked, submission state:', submission?.state);
    if (submission?.state !== 'help') return;
    createOrUpdate(null);
  };

  const submit = () => {
    console.log('submit clicked');
    createOrUpdate('submitted');
  };

  const resubmit = () => {
    console.log('resubmit clicked');
    createOrUpdate(null);
  };

  const save = () => {
    console.log('save clicked');
    createOrUpdate(null);
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
    context,
    saved,
    comments,
    updateJson,
    updateContext,
    raiseHand,
    unraiseHand,
    submit,
    resubmit,
    save,
    postComment,
  };
};
