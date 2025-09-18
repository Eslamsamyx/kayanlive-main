'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common);
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Palette,
  Highlighter,
  Minus
} from 'lucide-react';
import { useState, useCallback } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing your article...",
  className = ""
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#7afdd6] hover:text-[#b8a4ff] underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-[#7afdd6]/20 my-4',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border border-[#7afdd6]/20',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-[#7afdd6]/20 p-2',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-[#7afdd6]/20 p-2 bg-[#7afdd6]/10 font-semibold',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      TextStyle,
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-yellow-400/30',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-900/50 text-white p-4 rounded-lg my-4 overflow-x-auto',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[300px] focus:outline-none',
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setLinkUrl('');
    setShowLinkDialog(false);
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (!editor || !imageUrl) return;

    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl('');
    setShowImageDialog(false);
  }, [editor, imageUrl]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-[#7afdd6] text-[#2c2c2b]'
          : 'text-[#888888] hover:text-[#7afdd6] hover:bg-white/10'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  );

  const ColorButton = ({ color, label }: { color: string; label: string }) => (
    <button
      onClick={() => {
        editor.chain().focus().setColor(color).run();
        setShowColorPicker(false);
      }}
      className={`w-6 h-6 rounded border-2 border-white/20 hover:border-white/60 transition-all`}
      style={{ backgroundColor: color }}
      title={label}
    />
  );

  return (
    <div className={`rounded-[25px] overflow-hidden ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(50.5px)',
        WebkitBackdropFilter: 'blur(50.5px)',
        border: '2px solid rgba(122, 253, 214, 0.3)'
      }}
    >
      {/* Toolbar */}
      <div className="border-b border-[#7afdd6]/20 p-4">
        <div className="flex flex-wrap gap-1">
          {/* Text Formatting */}
          <div className="flex gap-1 border-r border-[#7afdd6]/20 pr-2 mr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold"
            >
              <Bold size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic"
            >
              <Italic size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Strikethrough"
            >
              <Strikethrough size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              title="Inline Code"
            >
              <Code size={16} />
            </ToolbarButton>
          </div>

          {/* Headings */}
          <div className="flex gap-1 border-r border-[#7afdd6]/20 pr-2 mr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              title="Heading 1"
            >
              <Heading1 size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              <Heading2 size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              title="Heading 3"
            >
              <Heading3 size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setParagraph().run()}
              isActive={editor.isActive('paragraph')}
              title="Paragraph"
            >
              <Type size={16} />
            </ToolbarButton>
          </div>

          {/* Lists and Quotes */}
          <div className="flex gap-1 border-r border-[#7afdd6]/20 pr-2 mr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <List size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Numbered List"
            >
              <ListOrdered size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Quote"
            >
              <Quote size={16} />
            </ToolbarButton>
          </div>

          {/* Alignment */}
          <div className="flex gap-1 border-r border-[#7afdd6]/20 pr-2 mr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              title="Align Left"
            >
              <AlignLeft size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
              title="Align Center"
            >
              <AlignCenter size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              title="Align Right"
            >
              <AlignRight size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              isActive={editor.isActive({ textAlign: 'justify' })}
              title="Justify"
            >
              <AlignJustify size={16} />
            </ToolbarButton>
          </div>

          {/* Colors and Highlighting */}
          <div className="flex gap-1 border-r border-[#7afdd6]/20 pr-2 mr-2 relative">
            <ToolbarButton
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Text Color"
            >
              <Palette size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              isActive={editor.isActive('highlight')}
              title="Highlight"
            >
              <Highlighter size={16} />
            </ToolbarButton>

            {showColorPicker && (
              <div className="absolute top-full left-0 mt-2 p-3 rounded-lg z-10"
                style={{
                  background: 'rgba(44, 44, 43, 0.95)',
                  backdropFilter: 'blur(50.5px)',
                  border: '1px solid rgba(122, 253, 214, 0.3)'
                }}
              >
                <div className="grid grid-cols-6 gap-2">
                  <ColorButton color="#000000" label="Black" />
                  <ColorButton color="#ffffff" label="White" />
                  <ColorButton color="#7afdd6" label="Brand Green" />
                  <ColorButton color="#b8a4ff" label="Brand Purple" />
                  <ColorButton color="#ff4444" label="Red" />
                  <ColorButton color="#44ff44" label="Green" />
                  <ColorButton color="#4444ff" label="Blue" />
                  <ColorButton color="#ffff44" label="Yellow" />
                  <ColorButton color="#ff44ff" label="Magenta" />
                  <ColorButton color="#44ffff" label="Cyan" />
                  <ColorButton color="#ff8844" label="Orange" />
                  <ColorButton color="#8844ff" label="Purple" />
                </div>
                <button
                  onClick={() => {
                    editor.chain().focus().unsetColor().run();
                    setShowColorPicker(false);
                  }}
                  className="mt-2 w-full px-2 py-1 text-xs text-[#888888] hover:text-[#7afdd6] transition-colors"
                >
                  Remove Color
                </button>
              </div>
            )}
          </div>

          {/* Media and Tables */}
          <div className="flex gap-1 border-r border-[#7afdd6]/20 pr-2 mr-2">
            <ToolbarButton
              onClick={() => setShowLinkDialog(true)}
              isActive={editor.isActive('link')}
              title="Insert Link"
            >
              <LinkIcon size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => setShowImageDialog(true)}
              title="Insert Image"
            >
              <ImageIcon size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={insertTable}
              title="Insert Table"
            >
              <TableIcon size={16} />
            </ToolbarButton>
          </div>

          {/* Code Block and Divider */}
          <div className="flex gap-1 border-r border-[#7afdd6]/20 pr-2 mr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive('codeBlock')}
              title="Code Block"
            >
              <Code size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Horizontal Rule"
            >
              <Minus size={16} />
            </ToolbarButton>
          </div>

          {/* Undo/Redo */}
          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo"
            >
              <Undo size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo"
            >
              <Redo size={16} />
            </ToolbarButton>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="p-6">
        <EditorContent
          editor={editor}
          className="text-white min-h-[300px]"
          style={{ fontFamily: '"Poppins", sans-serif' }}
        />
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="p-6 rounded-[20px] max-w-md w-full mx-4"
            style={{
              background: 'rgba(44, 44, 43, 0.95)',
              backdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)'
            }}
          >
            <h3 className="text-xl font-medium text-[#7afdd6] mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Insert Link
            </h3>
            <input
              type="url"
              placeholder="Enter URL..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full p-3 rounded-[10px] bg-white/10 text-white placeholder-[#888888] border border-[#7afdd6]/20 focus:border-[#7afdd6] focus:outline-none mb-4"
              style={{ fontFamily: '"Poppins", sans-serif' }}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={setLink}
                className="flex-1 py-2 px-4 bg-[#7afdd6] text-[#2c2c2b] rounded-[10px] font-medium hover:opacity-80 transition-opacity"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Insert
              </button>
              <button
                onClick={() => {
                  setLinkUrl('');
                  setShowLinkDialog(false);
                }}
                className="flex-1 py-2 px-4 bg-white/10 text-white rounded-[10px] font-medium hover:bg-white/20 transition-colors"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="p-6 rounded-[20px] max-w-md w-full mx-4"
            style={{
              background: 'rgba(44, 44, 43, 0.95)',
              backdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)'
            }}
          >
            <h3 className="text-xl font-medium text-[#7afdd6] mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Insert Image
            </h3>
            <input
              type="url"
              placeholder="Enter image URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full p-3 rounded-[10px] bg-white/10 text-white placeholder-[#888888] border border-[#7afdd6]/20 focus:border-[#7afdd6] focus:outline-none mb-4"
              style={{ fontFamily: '"Poppins", sans-serif' }}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={addImage}
                className="flex-1 py-2 px-4 bg-[#7afdd6] text-[#2c2c2b] rounded-[10px] font-medium hover:opacity-80 transition-opacity"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Insert
              </button>
              <button
                onClick={() => {
                  setImageUrl('');
                  setShowImageDialog(false);
                }}
                className="flex-1 py-2 px-4 bg-white/10 text-white rounded-[10px] font-medium hover:bg-white/20 transition-colors"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}