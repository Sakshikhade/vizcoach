import { editor } from 'monaco-editor';
import { Editor, EditorProps } from '@monaco-editor/react';
import { Submission } from 'db';

type JsonEditorProps = {
  submission: Submission | null;
  onErrors?: (messages: string[]) => void;
};

const props: EditorProps = {
  height: '24.5rem',
  language: 'json',
};

const options: editor.IStandaloneEditorConstructionOptions = {
  readOnlyMessage: {
    value: "You can't edit submitted unit!",
  },
  'semanticHighlighting.enabled': true,
  autoIndent: 'full',
  formatOnType: true,
  formatOnPaste: true,
  minimap: {
    enabled: false,
  },
};

export const JsonEditor = ({ submission, onErrors }: JsonEditorProps) => {
  const json = submission?.json
    ? JSON.stringify(submission.json, null, 4)
    : '{}';
  const readOnly = submission?.state === 'submitted';

  const onValidate = (markers: editor.IMarker[]) => {
    if (!onErrors) return;
    onErrors(markers.map((marker) => marker.message));
  };

  return (
    <Editor
      value={json}
      onValidate={onValidate}
      options={{ readOnly, ...options }}
      {...props}
    />
  );
};
