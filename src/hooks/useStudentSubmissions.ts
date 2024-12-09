import { useMemo, useState } from 'react';
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
      const comment = await client.postComment(submission, content);
      setSubmissionComments((prev) => ({
        ...prev,
        [submission.id]: [comment, ...prev[submission.id]],
      }));
    } catch (error) {
      console.error(error);
    }
  };

  return {
    ...data,
    getSubmissionUnit,
    getSubmissionDatasets,
    getSubmissionById,
    getSubmissionComments,
    postComment,
  };
};
