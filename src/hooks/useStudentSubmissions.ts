import { useEffect, useMemo, useState } from 'react';
import client, {
  Comment,
  GetStudentSubmissionsResponse,
  Submission,
  Unit,
} from 'db';
import { useDashboard } from './useDashboard';

export const useStudentSubmissions = () => {
  const { useData } = useDashboard();
  const data = useData!<GetStudentSubmissionsResponse>();
  const { units, unitDatasets, submissions } = data;
  const [submissionComments, setSubmissionComments] = useState<
    Record<string, Comment[]>
  >(data.submissionComments);
  const [submission, setSubmission] = useState<Submission | null>(
    submissions.length ? submissions[submissions.length - 1] : null,
  );

  const unitsMap = useMemo(
    () =>
      units.reduce(
        (record, unit) => Object.assign(record, { [unit.id]: unit }),
        {} as Record<string, Unit>,
      ),
    [units],
  );

  const submissionMap = useMemo(
    () =>
      submissions.reduce(
        (record, submission) =>
          Object.assign(record, { [submission.id]: submission }),
        {} as Record<string, Submission>,
      ),
    [submissions],
  );

  const getSubmissionUnit = (submission: Submission) =>
    unitsMap[submission.unitId];

  const getSubmissionDatasets = (submission: Submission) =>
    unitDatasets[getSubmissionUnit(submission).id];

  const getSubmissionById = (id: string) => submissionMap[id];

  const getSubmissionComments = (submission: Submission) =>
    submissionComments[submission.id];

  const postComment = async (submission: Submission, content: string) => {
    try {
      await client.postComment(submission, content);
    } catch (error) {
      console.error(error);
    }
  };

  // Removed teacher-only mutation helpers

  // Setting up subscription to listen to new comments
  useEffect(() => {
    if (!submission) {
      return;
    }

    // Registering to new comment updates
    client.registerPostCommentCallback(submission, (comment) => {
      setSubmissionComments((prev) => ({
        ...prev,
        [submission.id]: [comment, ...prev[submission.id]],
      }));
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

  // Subscribe to realtime submission updates while attempting
  useEffect(() => {
    if (!submission) return;
    client.registerSubmissionUpdateCallback(submission.id, (updated) => {
      // Only update if same unit and not submitted yet
      if (updated.unitId === submission.unitId) {
        setSubmission(updated);
      }
    });
    return () => client.unregisterSubmissionUpdateCallback();
  }, [submission]);

  return {
    ...data,
    submission,
    setSubmission,
    getSubmissionUnit,
    getSubmissionDatasets,
    getSubmissionById,
    getSubmissionComments,
    postComment,
  };
};
