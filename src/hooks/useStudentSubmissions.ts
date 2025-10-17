import { useEffect, useMemo, useState } from 'react';
import client, {
  Comment,
  GetStudentSubmissionsResponse,
  Submission,
  SubmissionState,
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

  const getLatestSubmissionForUnit = (unitId: string): Submission | null => {
    const unitSubs = submissions.filter((s) => s.unitId === unitId);
    if (!unitSubs.length) return null;
    return unitSubs.sort((a: any, b: any) => {
      const aAttempt = a.attempt || 1;
      const bAttempt = b.attempt || 1;
      return bAttempt - aAttempt || b.updated.getTime() - a.updated.getTime();
    })[0];
  };

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
