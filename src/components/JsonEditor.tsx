import { editor } from 'monaco-editor';
import { Editor, EditorProps } from '@monaco-editor/react';

type JsonEditorProps = {
  json: string;
  readOnly?: boolean;
  onJsonChange?: (value: string) => void;
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

export const JsonEditor = ({
  json,
  readOnly,
  onJsonChange,
}: JsonEditorProps) => {
  const onChange = (newValue?: string) => {
    if (onJsonChange && newValue) onJsonChange(newValue);
  };

  return (
    <Editor
      value={json}
      onChange={onChange}
      options={{ readOnly, ...options }}
      {...props}
    />
  );
};
