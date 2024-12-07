import { useMemo } from 'react';
import { GetStudentSubmissionsResponse, Submission, Unit } from 'db';
import { useDashboard } from './useDashboard';

export const useStudentSubmissions = () => {
  const { useData } = useDashboard();
  const data = useData!<GetStudentSubmissionsResponse>();
  const { units, unitDatasets, submissions } = data;

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

  return {
    ...data,
    getSubmissionUnit,
    getSubmissionDatasets,
    getSubmissionById,
  };
};
