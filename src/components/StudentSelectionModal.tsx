import React, { useState, useEffect } from 'react';
import { User, Group as GroupType } from '../db/types';
import client from '../db/client';

interface StudentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: GroupType;
  onConfirm: (selectedStudentIds: string[]) => void;
  client: typeof client;
}

const StudentSelectionModal: React.FC<StudentSelectionModalProps> = ({
  isOpen,
  onClose,
  group,
  onConfirm,
  client,
}) => {
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && group.id) {
      loadStudents();
    }
  }, [isOpen, group.id]);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const groupStudents = await client.getStudents(group.id);
      setStudents(groupStudents);
      // Pre-select all students by default
      setSelectedStudents(groupStudents.map((s: User) => s.id));
    } catch (error) {
      console.error('Failed to load students:', error);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const handleSelectAll = () => {
    setSelectedStudents(students.map((s) => s.id));
  };

  const handleSelectNone = () => {
    setSelectedStudents([]);
  };

  const handleConfirm = () => {
    if (selectedStudents.length > 0) {
      onConfirm(selectedStudents);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Create Group Chat for {group.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-3">
            Select students to include in this group chat:
          </p>
          <div className="flex gap-2 mb-3">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Select All
            </button>
            <button
              onClick={handleSelectNone}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Select None
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-gray-500">Loading students...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center h-32">
              <div className="text-red-500 mb-2">{error}</div>
              <button
                onClick={loadStudents}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          ) : students.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-gray-500">
                No students found in this group
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    id={student.id}
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleStudentToggle(student.id)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={student.id} className="flex-1 cursor-pointer">
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-500">{student.email}</div>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedStudents.length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Create Group Chat ({selectedStudents.length} students)
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentSelectionModal;
