import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import CodeBlock from '@tiptap/extension-code-block';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code, Table as TableIcon, Link as LinkIcon, Undo, Redo, } from 'lucide-react';
export const RichTextEditor = ({ content, onChange, placeholder = 'Write comprehensive lesson content here...', }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
            }),
            CodeBlock,
            Link.configure({
                openOnClick: false,
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
        if (url === null)
            return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };
    const addTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };
    return (_jsxs("div", { className: "border border-slate-700 rounded-xl overflow-hidden bg-slate-900 focus-within:border-brand-500 transition-colors", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-1 p-2 bg-slate-800/80 border-b border-slate-700 text-slate-300", children: [_jsx("button", { type: "button", onClick: () => editor.chain().focus().toggleBold().run(), className: `p-2 rounded hover:bg-slate-700 ${editor.isActive('bold') ? 'bg-brand-500/20 text-brand-400' : ''}`, title: "Bold", children: _jsx(Bold, { className: "w-4 h-4" }) }), _jsx("button", { type: "button", onClick: () => editor.chain().focus().toggleItalic().run(), className: `p-2 rounded hover:bg-slate-700 ${editor.isActive('italic') ? 'bg-brand-500/20 text-brand-400' : ''}`, title: "Italic", children: _jsx(Italic, { className: "w-4 h-4" }) }), _jsx("div", { className: "w-px h-5 bg-slate-700 mx-1" }), _jsx("button", { type: "button", onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), className: `p-2 rounded hover:bg-slate-700 ${editor.isActive('heading', { level: 1 }) ? 'bg-brand-500/20 text-brand-400' : ''}`, title: "Heading 1", children: _jsx(Heading1, { className: "w-4 h-4" }) }), _jsx("button", { type: "button", onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), className: `p-2 rounded hover:bg-slate-700 ${editor.isActive('heading', { level: 2 }) ? 'bg-brand-500/20 text-brand-400' : ''}`, title: "Heading 2", children: _jsx(Heading2, { className: "w-4 h-4" }) }), _jsx("button", { type: "button", onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), className: `p-2 rounded hover:bg-slate-700 ${editor.isActive('heading', { level: 3 }) ? 'bg-brand-500/20 text-brand-400' : ''}`, title: "Heading 3", children: _jsx(Heading3, { className: "w-4 h-4" }) }), _jsx("div", { className: "w-px h-5 bg-slate-700 mx-1" }), _jsx("button", { type: "button", onClick: () => editor.chain().focus().toggleBulletList().run(), className: `p-2 rounded hover:bg-slate-700 ${editor.isActive('bulletList') ? 'bg-brand-500/20 text-brand-400' : ''}`, title: "Bullet List", children: _jsx(List, { className: "w-4 h-4" }) }), _jsx("button", { type: "button", onClick: () => editor.chain().focus().toggleOrderedList().run(), className: `p-2 rounded hover:bg-slate-700 ${editor.isActive('orderedList') ? 'bg-brand-500/20 text-brand-400' : ''}`, title: "Ordered List", children: _jsx(ListOrdered, { className: "w-4 h-4" }) }), _jsx("div", { className: "w-px h-5 bg-slate-700 mx-1" }), _jsx("button", { type: "button", onClick: () => editor.chain().focus().toggleBlockquote().run(), className: `p-2 rounded hover:bg-slate-700 ${editor.isActive('blockquote') ? 'bg-brand-500/20 text-brand-400' : ''}`, title: "Quote", children: _jsx(Quote, { className: "w-4 h-4" }) }), _jsx("button", { type: "button", onClick: () => editor.chain().focus().toggleCodeBlock().run(), className: `p-2 rounded hover:bg-slate-700 ${editor.isActive('codeBlock') ? 'bg-brand-500/20 text-brand-400' : ''}`, title: "Code Block", children: _jsx(Code, { className: "w-4 h-4" }) }), _jsx("button", { type: "button", onClick: setLink, className: `p-2 rounded hover:bg-slate-700 ${editor.isActive('link') ? 'bg-brand-500/20 text-brand-400' : ''}`, title: "Insert Link", children: _jsx(LinkIcon, { className: "w-4 h-4" }) }), _jsx("button", { type: "button", onClick: addTable, className: "p-2 rounded hover:bg-slate-700", title: "Insert Table", children: _jsx(TableIcon, { className: "w-4 h-4" }) }), _jsx("div", { className: "w-px h-5 bg-slate-700 mx-1" }), _jsx("button", { type: "button", onClick: () => editor.chain().focus().undo().run(), className: "p-2 rounded hover:bg-slate-700", title: "Undo", children: _jsx(Undo, { className: "w-4 h-4" }) }), _jsx("button", { type: "button", onClick: () => editor.chain().focus().redo().run(), className: "p-2 rounded hover:bg-slate-700", title: "Redo", children: _jsx(Redo, { className: "w-4 h-4" }) })] }), _jsx("div", { className: "p-4 min-h-[250px] prose prose-invert max-w-none focus:outline-none", children: _jsx(EditorContent, { editor: editor }) })] }));
};
