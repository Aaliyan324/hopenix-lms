import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import CodeBlock from '@tiptap/extension-code-block';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Table as TableIcon,
  Link as LinkIcon,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Highlighter,
  Image,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Write comprehensive lesson content here...',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlock,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-orange-600 hover:text-orange-700 underline decoration-2 underline-offset-2 transition-colors',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  // Toolbar button helper
  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    title, 
    children,
    disabled = false,
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    title: string; 
    children: React.ReactNode;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 ${
        isActive ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-300 shadow-sm' : 'text-stone-500'
      } ${disabled ? 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-stone-500' : ''}`}
      title={title}
    >
      {children}
    </button>
  );

  // Toolbar separator
  const Separator = () => <div className="w-px h-6 bg-stone-200 mx-0.5" />;

  return (
    <div className="border border-orange-100 rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 transition-all shadow-[0_8px_30px_rgba(249,115,22,0.06)]">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-orange-50/30 border-b border-orange-100 text-stone-600">
        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <Separator />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <Separator />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <Separator />

        {/* Block Elements */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote Block"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <Separator />

        {/* Links & Tables */}
        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive('link')}
          title="Insert Link (Ctrl+K)"
        >
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={addTable}
          isActive={false}
          title="Insert Table"
        >
          <TableIcon className="w-4 h-4" />
        </ToolbarButton>

        <Separator />

        {/* Undo / Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content Box */}
      <div className="p-4 sm:p-6 min-h-[280px] prose prose-slate max-w-none focus:outline-none font-['Inter',sans-serif]">
        <EditorContent editor={editor} />
      </div>

      {/* Character Count */}
      <div className="px-4 sm:px-6 py-2 border-t border-orange-100 bg-orange-50/20 flex justify-between text-xs text-stone-400 font-['Inter',sans-serif]">
        <span>
          {editor.storage.characterCount?.words || 0} words
        </span>
        <span>
          {editor.storage.characterCount?.characters || 0} characters
        </span>
      </div>

      {/* Custom styles for the editor content */}
      <style>{`
        .ProseMirror {
          outline: none;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #94a3b8;
          pointer-events: none;
          height: 0;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .ProseMirror ul, 
        .ProseMirror ol {
          padding-left: 1.5rem;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #f97316;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #475569;
          font-style: italic;
          background: #fff7ed;
          border-radius: 0 0.75rem 0.75rem 0;
          padding: 0.75rem 1rem;
        }
        .ProseMirror code {
          background-color: #f1f5f9;
          padding: 0.2rem 0.4rem;
          border-radius: 0.375rem;
          font-size: 0.875em;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          color: #ea580c;
        }
        .ProseMirror pre {
          background: #0f172a;
          color: #e2e8f0;
          padding: 1rem 1.25rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 1rem 0;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.875rem;
          border: 1px solid #1e293b;
        }
        .ProseMirror pre code {
          background: transparent;
          padding: 0;
          color: inherit;
          font-family: inherit;
        }
        .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
          font-size: 0.875rem;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .ProseMirror th,
        .ProseMirror td {
          border: 1px solid #e2e8f0;
          padding: 0.625rem 0.875rem;
          text-align: left;
        }
        .ProseMirror th {
          background-color: #f8fafc;
          font-weight: 600;
          color: #0f172a;
        }
        .ProseMirror tr:nth-child(even) {
          background-color: #fafafa;
        }
        .ProseMirror tr:hover {
          background-color: #f1f5f9;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 1rem 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .ProseMirror a {
          color: #f97316;
          text-decoration: underline;
          text-underline-offset: 2px;
          text-decoration-thickness: 2px;
          transition: color 0.2s;
        }
        .ProseMirror a:hover {
          color: #ea580c;
        }
        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-family: 'Poppins', Georgia, serif;
          color: #0f172a;
          letter-spacing: -0.02em;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.25rem;
          margin-bottom: 0.625rem;
          font-family: 'Poppins', Georgia, serif;
          color: #1e293b;
          letter-spacing: -0.01em;
        }
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          font-family: 'Poppins', Georgia, serif;
          color: #334155;
        }
        .ProseMirror p {
          margin-bottom: 0.75rem;
          line-height: 1.8;
          color: #334155;
          font-size: 1rem;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          margin-bottom: 0.75rem;
        }
        .ProseMirror li {
          margin-bottom: 0.25rem;
          line-height: 1.8;
        }
        .ProseMirror li::marker {
          color: #f97316;
        }
        .ProseMirror hr {
          border: none;
          border-top: 2px solid #e2e8f0;
          margin: 1.5rem 0;
        }
        .ProseMirror .tableWrapper {
          overflow-x: auto;
        }
        .ProseMirror .selectedCell {
          background-color: #fff7ed;
          border: 2px solid #f97316;
        }
      `}</style>
    </div>
  );
};