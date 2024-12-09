import { useEffect, useRef } from 'react';
import {
  MenuButtonAlignCenter,
  MenuButtonAlignJustify,
  MenuButtonAlignLeft,
  MenuButtonAlignRight,
  MenuButtonBold,
  MenuButtonBulletedList,
  MenuButtonItalic,
  MenuButtonOrderedList,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditor,
  RichTextEditorRef,
} from 'mui-tiptap';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';

type RichEditorProps = {
  value?: string;
  onChange: (value: string) => void;
};

export const RichEditor = ({ value, onChange }: RichEditorProps) => {
  const editorRef = useRef<RichTextEditorRef | null>(null);

  useEffect(() => {
    if (!editorRef.current || value?.length) return;
    editorRef.current.editor?.commands.clearContent();
  }, [value]);

  return (
    <RichTextEditor
      ref={editorRef}
      content={value}
      onUpdate={({ editor }) => onChange(editor.getHTML())}
      extensions={[
        StarterKit.configure({
          orderedList: {
            HTMLAttributes: {
              style: 'padding-left: 1rem;',
            },
          },
          bulletList: {
            HTMLAttributes: {
              style: 'padding-left: 1rem;',
            },
          },
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
      ]}
      renderControls={() => (
        <MenuControlsContainer>
          <MenuSelectHeading />
          <MenuDivider />
          <MenuButtonAlignLeft />
          <MenuButtonAlignCenter />
          <MenuButtonAlignRight />
          <MenuButtonAlignJustify />
          <MenuDivider />
          <MenuButtonBold />
          <MenuButtonItalic />
          <MenuDivider />
          <MenuButtonBulletedList />
          <MenuButtonOrderedList />
          <MenuDivider />
        </MenuControlsContainer>
      )}
    />
  );
};
