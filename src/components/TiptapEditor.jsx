import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Heading1, Heading2, Heading3, Text, FileText, CheckSquare, List } from 'lucide-react';

// Theme-aware helper
const t4 = (theme, map) => map[theme] || map.cyberpunk;

export default function TiptapEditor({
    initialContent,
    onUpdate,
    onSave, // triggered on debounced silence or Ctrl+G
    theme,
    className
}) {
    const saveRef = useRef(onSave);
    const updateRef = useRef(onUpdate);
    const saveTimeout = useRef(null);

    useEffect(() => {
        saveRef.current = onSave;
        updateRef.current = onUpdate;
    }, [onSave, onUpdate]);

    const performSave = useCallback(() => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        if (saveRef.current) saveRef.current();
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content: initialContent || '',
        onUpdate: ({ editor }) => {
            if (updateRef.current) updateRef.current(editor.getHTML());

            // Auto-save debounce (e.g. 1 second after stop typing)
            if (saveTimeout.current) clearTimeout(saveTimeout.current);
            saveTimeout.current = setTimeout(() => {
                if (saveRef.current) saveRef.current();
            }, 1000);
        },
        editorProps: {
            attributes: {
                class: `focus:outline-none min-h-[300px] ${className || ''}`,
            },
            handleKeyDown: (view, event) => {
                if (event.ctrlKey && event.key.toLowerCase() === 'g') {
                    event.preventDefault();
                    performSave();
                    return true;
                }
                return false;
            }
        },
    });

    useEffect(() => {
        if (editor && initialContent !== editor.getHTML()) {
            // Only update editor if initial content really differs safely (e.g. from an external switch)
            // But we don't want to overwrite while user is typing. We check if the editor is empty or it's a completely new note.
            // A simple strategy is to let the parent unmount/remount TiptapEditor by passing a key={noteId}
        }
    }, [editor, initialContent]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeout.current) clearTimeout(saveTimeout.current);
        };
    }, []);

    if (!editor) {
        return null;
    }

    const baseStyles = '[&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-8 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-6 [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2 [&_p]:min-h-[1.5rem] [&_blockquote]:pl-4 [&_blockquote]:border-l-4 [&_blockquote]:italic [&_blockquote]:my-3';

    const editorStyles = t4(theme, {
        cyberpunk: `${baseStyles} [&_blockquote]:border-cyber-primary/70 [&_hr]:border-cyber-primary/40 [&_hr]:border-dashed [&_hr]:border-t-2 [&_hr]:my-6 [&_em]:text-cyber-primary [&_em]:font-bold [&_em]:not-italic [&_em]:drop-shadow-[0_0_2px_rgba(255,0,85,0.4)] [&_strong]:text-cyber-primary [&_strong]:drop-shadow-[0_0_2px_rgba(255,0,85,0.4)]`,
        paper: `${baseStyles} [&_blockquote]:border-neutral-300 [&_hr]:border-neutral-300 [&_hr]:border-t-2 [&_hr]:my-6 [&_em]:text-neutral-900 [&_em]:font-bold [&_em]:not-italic [&_strong]:text-neutral-900`,
        dark: `${baseStyles} [&_blockquote]:border-dark-border [&_hr]:border-dark-border [&_hr]:border-t-2 [&_hr]:my-6 [&_em]:text-dark-text [&_em]:font-bold [&_em]:not-italic [&_strong]:text-dark-text`,
        sakura: `${baseStyles} [&_blockquote]:border-sakura-blossom/60 [&_hr]:border-sakura-blossom/60 [&_hr]:border-t-2 [&_hr]:my-6 [&_em]:text-sakura-deep [&_em]:font-bold [&_em]:not-italic [&_strong]:text-sakura-deep`,
    });

    const setHeading = (level) => {
        const { $from } = editor.state.selection;
        editor.chain().focus().deleteRange({ from: $from.start(), to: $from.end() }).setHeading({ level }).run();
    };

    const setParagraph = () => {
        const { $from } = editor.state.selection;
        editor.chain().focus().deleteRange({ from: $from.start(), to: $from.end() }).setParagraph().run();
    };

    const setList = (type) => {
        const { $from } = editor.state.selection;
        const chain = editor.chain().focus().deleteRange({ from: $from.start(), to: $from.end() });
        if (type === 'bullet') chain.toggleBulletList().run();
        else chain.toggleOrderedList().run();
    };

    const isDark = theme === 'cyberpunk' || theme === 'dark';
    const menuBg = isDark ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-800';
    const hoverBg = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100';

    return (
        <div className={`tiptap-wrapper ${editorStyles} h-full relative`}>

            <EditorContent editor={editor} className="h-full" />
        </div>
    );
}
