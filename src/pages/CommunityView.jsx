import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Globe, Plus, Users, FolderOpen, FileText, CheckSquare,
    ChevronRight, Crown, UserMinus, UserPlus, X, Check,
    MoreHorizontal, Trash2, Edit3, Save, ArrowLeft, RefreshCw,
    BookOpen, Layers, ClipboardList
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import { Avatar } from '../components/Navbar';
import ProgressBar from '../components/ProgressBar';
import TiptapEditor from '../components/TiptapEditor';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
const truncate = (s, n) => s && s.length > n ? s.slice(0, n) + '…' : (s || '');

// ── Theme-aware helper ────────────────────────────────────────────────────────
const t4 = (theme, map) => map[theme] || map.cyberpunk;

// ── Styles helper ─────────────────────────────────────────────────────────────
const useStyles = (theme) => ({
    divider: t4(theme, { cyberpunk: 'border-cyber-primary/15', paper: 'border-neutral-200', dark: 'border-dark-border', sakura: 'border-sakura-blossom/30' }),
    text: t4(theme, { cyberpunk: 'text-cyber-secondary', paper: 'text-neutral-800', dark: 'text-dark-text', sakura: 'text-sakura-ink' }),
    muted: t4(theme, { cyberpunk: 'text-cyber-secondary/45', paper: 'text-neutral-400', dark: 'text-dark-muted', sakura: 'text-sakura-muted' }),
    subtle: t4(theme, { cyberpunk: 'text-cyber-secondary/70', paper: 'text-neutral-500', dark: 'text-dark-subtle', sakura: 'text-sakura-subtle' }),
    panelBg: t4(theme, { cyberpunk: 'bg-cyber-dark/95', paper: 'bg-neutral-50', dark: 'bg-dark-surface', sakura: 'bg-sakura-surface' }),
    mainBg: t4(theme, { cyberpunk: 'bg-cyber-black/80', paper: 'bg-white', dark: 'bg-dark-bg', sakura: 'bg-sakura-bg' }),
    scrollCls: t4(theme, { cyberpunk: 'cyber-scrollbar', paper: '', dark: '', sakura: '' }),
    cardBg: t4(theme, {
        cyberpunk: 'bg-cyber-dark/40 border border-cyber-primary/20',
        paper: 'bg-white border border-neutral-200 shadow-sm',
        dark: 'bg-dark-surface border border-dark-border',
        sakura: 'bg-white sakura-card',
    }),
    cardHover: t4(theme, {
        cyberpunk: 'hover:border-cyber-primary/50 hover:bg-cyber-dark/60',
        paper: 'hover:border-neutral-300',
        dark: 'hover:border-dark-primary/30 hover:bg-dark-elevated',
        sakura: 'hover:border-sakura-deep/30 hover:shadow-md',
    }),
    inputCls: t4(theme, {
        cyberpunk: 'bg-cyber-black/60 border border-cyber-primary/40 text-cyber-secondary placeholder-cyber-secondary/30 focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary/30 outline-none transition-all',
        paper: 'bg-white border border-neutral-200 text-neutral-800 placeholder-neutral-400 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-200 outline-none transition-all',
        dark: 'bg-dark-elevated border border-dark-border text-dark-text placeholder-dark-muted focus:border-dark-primary/50 focus:ring-1 focus:ring-dark-primary/20 outline-none transition-all rounded-lg',
        sakura: 'bg-white border border-sakura-blossom/40 text-sakura-ink placeholder-sakura-muted focus:border-sakura-deep/50 focus:ring-1 focus:ring-sakura-blossom/25 outline-none transition-all rounded-xl',
    }),
    btnPrimary: t4(theme, {
        cyberpunk: 'bg-cyber-primary text-black font-semibold hover:bg-cyber-primary/85 shadow-[0_0_8px_#ff005533] transition-all',
        paper: 'bg-neutral-900 text-white font-semibold hover:bg-neutral-700 transition-all',
        dark: 'bg-dark-primary text-white font-semibold hover:bg-dark-primary/85 transition-all rounded-lg',
        sakura: 'bg-sakura-deep text-white font-semibold hover:bg-sakura-deep/85 transition-all rounded-xl shadow-sm',
    }),
    btnSecondary: t4(theme, {
        cyberpunk: 'border border-cyber-secondary/30 text-cyber-secondary hover:bg-cyber-secondary/10 transition-all',
        paper: 'border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:border-neutral-300 transition-all',
        dark: 'border border-dark-border text-dark-subtle hover:bg-dark-elevated hover:text-dark-text transition-all rounded-lg',
        sakura: 'border border-sakura-blossom/40 text-sakura-subtle hover:bg-sakura-petal/40 hover:text-sakura-ink transition-all rounded-xl',
    }),
    btnDanger: t4(theme, {
        cyberpunk: 'border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all',
        paper: 'border border-red-200 text-red-500 hover:bg-red-50 transition-all',
        dark: 'border border-red-900/40 text-red-400 hover:bg-red-950/40 transition-all rounded-lg',
        sakura: 'border border-red-200 text-red-400 hover:bg-red-50 transition-all rounded-xl',
    }),
    // Icon theme colors
    iconAccent: t4(theme, { cyberpunk: 'text-cyber-primary', paper: 'text-neutral-500', dark: 'text-dark-primary', sakura: 'text-sakura-deep' }),
    iconMuted: t4(theme, { cyberpunk: 'text-cyber-secondary/60', paper: 'text-neutral-300', dark: 'text-dark-muted', sakura: 'text-sakura-muted' }),
    plusBtnCls: t4(theme, {
        cyberpunk: 'hover:bg-cyber-primary/10 text-cyber-secondary/50 hover:text-cyber-secondary',
        paper: 'hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700',
        dark: 'hover:bg-dark-elevated text-dark-muted hover:text-dark-text',
        sakura: 'hover:bg-sakura-petal/50 text-sakura-muted hover:text-sakura-ink',
    }),
    sidebarItem: (active) => t4(theme, {
        cyberpunk: `transition-all group ${active ? 'bg-cyber-primary/12 border-l-2 border-l-cyber-primary text-cyber-primary' : 'hover:bg-cyber-primary/5 text-cyber-secondary/80 hover:text-cyber-secondary'}`,
        paper: `transition-all group ${active ? 'bg-neutral-100 text-neutral-900 font-semibold' : 'hover:bg-neutral-100/80 text-neutral-600 hover:text-neutral-800'}`,
        dark: `transition-all group ${active ? 'bg-dark-primary/12 border-l-2 border-l-dark-primary text-dark-text font-semibold' : 'hover:bg-dark-elevated text-dark-muted hover:text-dark-text'}`,
        sakura: `transition-all group ${active ? 'bg-sakura-blossom/20 border-l-2 border-l-sakura-deep text-sakura-ink font-semibold' : 'hover:bg-sakura-petal/30 text-sakura-muted hover:text-sakura-ink'}`,
    }),
    // Root
    rootCls: t4(theme, {
        cyberpunk: 'bg-cyber-dark text-cyber-secondary font-mono',
        paper: 'bg-white text-neutral-800 font-sans',
        dark: 'bg-dark-bg text-dark-text',
        sakura: 'bg-sakura-bg text-sakura-ink',
    }),
    // Title colors
    titleCls: t4(theme, { cyberpunk: 'text-cyber-primary', paper: 'text-neutral-900', dark: 'text-dark-text', sakura: 'text-sakura-ink' }),
    titleIcon: t4(theme, { cyberpunk: 'text-cyber-primary/30', paper: 'text-neutral-200', dark: 'text-dark-primary/30', sakura: 'text-sakura-blossom/40' }),
    // Empty state icon
    emptyIcon: t4(theme, { cyberpunk: 'text-cyber-primary/15', paper: 'text-neutral-100', dark: 'text-dark-border', sakura: 'text-sakura-blossom/30' }),
    // Sidebar initial badge
    badgeActive: t4(theme, { cyberpunk: 'bg-cyber-primary text-black', paper: 'bg-neutral-900 text-white', dark: 'bg-dark-primary text-white', sakura: 'bg-sakura-deep text-white' }),
    badgeDefault: t4(theme, { cyberpunk: 'bg-cyber-primary/20 text-cyber-primary', paper: 'bg-neutral-200 text-neutral-600', dark: 'bg-dark-elevated text-dark-subtle', sakura: 'bg-sakura-petal text-sakura-subtle' }),
    crownCls: t4(theme, { cyberpunk: 'text-cyber-primary/50', paper: 'text-amber-400', dark: 'text-dark-accent', sakura: 'text-sakura-gold' }),
    // Member card
    memberBg: t4(theme, {
        cyberpunk: 'bg-cyber-dark/30 border border-cyber-primary/10',
        paper: 'bg-neutral-50 border border-neutral-100',
        dark: 'bg-dark-surface border border-dark-border rounded-xl',
        sakura: 'bg-white border border-sakura-blossom/25 rounded-xl sakura-card',
    }),
    memberBadge: t4(theme, {
        cyberpunk: 'bg-cyber-primary/15 text-cyber-primary',
        paper: 'bg-neutral-200 text-neutral-600',
        dark: 'bg-dark-primary/15 text-dark-primary',
        sakura: 'bg-sakura-blossom/20 text-sakura-deep',
    }),
    ownerBadge: t4(theme, {
        cyberpunk: 'bg-cyber-primary/15 text-cyber-primary',
        paper: 'bg-amber-50 text-amber-600 border border-amber-200',
        dark: 'bg-dark-accent/15 text-dark-accent border border-dark-accent/30',
        sakura: 'bg-sakura-gold/15 text-sakura-gold border border-sakura-gold/30',
    }),
    // Empty dashed border
    emptyBorder: t4(theme, {
        cyberpunk: 'border-cyber-primary/15 text-cyber-secondary/30',
        paper: 'border-neutral-200 text-neutral-300',
        dark: 'border-dark-border text-dark-muted',
        sakura: 'border-sakura-blossom/30 text-sakura-muted',
    }),
    // Task hover
    taskHover: t4(theme, { cyberpunk: 'hover:bg-cyber-primary/5', paper: 'hover:bg-neutral-50', dark: 'hover:bg-dark-elevated', sakura: 'hover:bg-sakura-petal/20' }),
    // Task checkbox
    checkDone: t4(theme, { cyberpunk: 'bg-cyber-primary border-cyber-primary', paper: 'bg-neutral-900 border-neutral-900', dark: 'bg-dark-primary border-dark-primary', sakura: 'bg-sakura-deep border-sakura-deep' }),
    checkUndone: t4(theme, { cyberpunk: 'border-cyber-primary/40 hover:border-cyber-primary', paper: 'border-neutral-300 hover:border-neutral-500', dark: 'border-dark-border hover:border-dark-primary', sakura: 'border-sakura-blossom/50 hover:border-sakura-deep' }),
    checkColor: t4(theme, { cyberpunk: 'black', paper: 'white', dark: 'white', sakura: 'white' }),
    // Task add border
    taskAddBorder: t4(theme, {
        cyberpunk: 'border-cyber-primary/15 hover:border-cyber-primary/30 focus-within:border-cyber-primary/40',
        paper: 'border-neutral-200 hover:border-neutral-300 focus-within:border-neutral-400',
        dark: 'border-dark-border hover:border-dark-primary/30 focus-within:border-dark-primary/40',
        sakura: 'border-sakura-blossom/30 hover:border-sakura-deep/30 focus-within:border-sakura-deep/40',
    }),
    taskDeleteCls: t4(theme, {
        cyberpunk: 'text-red-400/60 hover:text-red-400 hover:bg-red-400/10',
        paper: 'text-neutral-300 hover:text-red-400 hover:bg-red-50',
        dark: 'text-dark-muted hover:text-red-400 hover:bg-red-950/40',
        sakura: 'text-sakura-muted hover:text-red-400 hover:bg-red-50',
    }),
    // Tab
    tabActive: t4(theme, { cyberpunk: 'border-cyber-primary text-cyber-primary', paper: 'border-neutral-900 text-neutral-900', dark: 'border-dark-primary text-dark-text', sakura: 'border-sakura-deep text-sakura-ink' }),
    tabDefault: t4(theme, { cyberpunk: 'border-transparent text-cyber-secondary/45 hover:text-cyber-secondary', paper: 'border-transparent text-neutral-400 hover:text-neutral-600', dark: 'border-transparent text-dark-muted hover:text-dark-text', sakura: 'border-transparent text-sakura-muted hover:text-sakura-ink' }),
    tabBadgeActive: t4(theme, { cyberpunk: 'bg-cyber-primary/20 text-cyber-primary', paper: 'bg-neutral-100 text-neutral-600', dark: 'bg-dark-primary/15 text-dark-primary', sakura: 'bg-sakura-blossom/20 text-sakura-deep' }),
    tabBadgeDefault: t4(theme, { cyberpunk: 'bg-cyber-primary/5 text-cyber-secondary/40', paper: 'bg-neutral-100 text-neutral-400', dark: 'bg-dark-elevated text-dark-muted', sakura: 'bg-sakura-petal text-sakura-muted' }),
    // Notes sidebar item
    noteItemActive: t4(theme, { cyberpunk: 'bg-cyber-primary/15 text-cyber-primary', paper: 'bg-neutral-200 text-neutral-900', dark: 'bg-dark-primary/15 text-dark-text', sakura: 'bg-sakura-blossom/25 text-sakura-ink' }),
    noteItemDefault: t4(theme, { cyberpunk: 'text-cyber-secondary/70 hover:bg-cyber-primary/8 hover:text-cyber-secondary', paper: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800', dark: 'text-dark-muted hover:bg-dark-elevated hover:text-dark-text', sakura: 'text-sakura-muted hover:bg-sakura-petal/30 hover:text-sakura-ink' }),
    noteSideFooter: t4(theme, { cyberpunk: 'text-cyber-secondary/50 hover:text-cyber-secondary hover:bg-cyber-primary/8', paper: 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100', dark: 'text-dark-muted hover:text-dark-text hover:bg-dark-elevated', sakura: 'text-sakura-muted hover:text-sakura-ink hover:bg-sakura-petal/30' }),
    // Breadcrumb btns
    breadBtn: t4(theme, { cyberpunk: 'hover:bg-cyber-primary/10 text-cyber-secondary/60 hover:text-cyber-secondary', paper: 'hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600', dark: 'hover:bg-dark-elevated text-dark-muted hover:text-dark-text', sakura: 'hover:bg-sakura-petal/40 text-sakura-muted hover:text-sakura-ink' }),
    refreshBtn: t4(theme, { cyberpunk: 'hover:bg-cyber-primary/10 text-cyber-secondary/40 hover:text-cyber-secondary', paper: 'hover:bg-neutral-100 text-neutral-400', dark: 'hover:bg-dark-elevated text-dark-muted hover:text-dark-text', sakura: 'hover:bg-sakura-petal/40 text-sakura-muted hover:text-sakura-ink' }),
    // Content title/note colors
    contentTitle: t4(theme, { cyberpunk: 'text-cyber-primary placeholder-cyber-primary/20', paper: 'text-neutral-900 placeholder-neutral-200', dark: 'text-dark-text placeholder-dark-muted', sakura: 'text-sakura-ink placeholder-sakura-muted' }),
    contentBody: t4(theme, { cyberpunk: 'text-cyber-secondary/90 placeholder-cyber-secondary/20', paper: 'text-neutral-700 placeholder-neutral-300', dark: 'text-dark-subtle placeholder-dark-muted', sakura: 'text-sakura-ink/80 placeholder-sakura-muted' }),
    contentView: t4(theme, { cyberpunk: 'text-cyber-secondary/85', paper: 'text-neutral-700', dark: 'text-dark-subtle', sakura: 'text-sakura-ink/80' }),
});

// ── Modal ─────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, onSave, theme, primaryText = 'Crear', fields }) => {
    const s = useStyles(theme);
    const [values, setValues] = useState(fields.reduce((a, f) => ({ ...a, [f.key]: '' }), {}));
    const isValid = fields.filter(f => f.required).every(f => values[f.key].trim());

    const modalBg = t4(theme, {
        cyberpunk: 'bg-cyber-dark border border-cyber-primary/40',
        paper: 'bg-white border border-neutral-200',
        dark: 'bg-dark-surface border border-dark-border',
        sakura: 'bg-white border border-sakura-blossom/30 sakura-card',
    });
    const closeBtnCls = t4(theme, {
        cyberpunk: 'hover:bg-cyber-primary/10 text-cyber-secondary',
        paper: 'hover:bg-neutral-100 text-neutral-400',
        dark: 'hover:bg-dark-elevated text-dark-muted',
        sakura: 'hover:bg-sakura-petal/40 text-sakura-muted',
    });

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={`w-full max-w-md rounded-xl shadow-2xl overflow-hidden ${modalBg}`}>
                <div className={`flex items-center justify-between px-6 py-4 border-b ${s.divider}`}>
                    <h2 className={`text-base font-semibold ${s.text}`}>{title}</h2>
                    <button onClick={onClose} className={`p-1 rounded ${closeBtnCls}`}><X size={18} /></button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    {fields.map(f => (
                        <div key={f.key}>
                            <label className={`block text-xs font-medium uppercase tracking-wider mb-1.5 ${s.subtle}`}>{f.label}</label>
                            {f.multiline ? (
                                <textarea value={values[f.key]} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                                    placeholder={f.placeholder} rows={3}
                                    className={`w-full px-3 py-2 text-sm rounded-lg resize-none ${s.inputCls}`} />
                            ) : (
                                <input autoFocus={f.autoFocus} value={values[f.key]} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                                    onKeyDown={e => e.key === 'Enter' && !f.multiline && isValid && onSave(values)}
                                    placeholder={f.placeholder}
                                    className={`w-full px-3 py-2 text-sm rounded-lg ${s.inputCls}`} />
                            )}
                        </div>
                    ))}
                </div>
                <div className={`flex gap-2 justify-end px-6 py-4 border-t ${s.divider}`}>
                    <button onClick={onClose} className={`px-4 py-2 text-sm rounded-lg ${s.btnSecondary}`}>Cancelar</button>
                    <button onClick={() => isValid && onSave(values)} disabled={!isValid}
                        className={`px-4 py-2 text-sm rounded-lg ${s.btnPrimary} disabled:opacity-40`}>{primaryText}</button>
                </div>
            </div>
        </div>
    );
};

// ── Project Detail ────────────────────────────────────────────────────────────
const ProjectDetail = ({ project, theme, onUpdate, onClose, selectedNote, setSelectedNote, isCreatingNote, setIsCreatingNote }) => {
    const s = useStyles(theme);
    const [tab, setTab] = useState((selectedNote || isCreatingNote) ? 'notes' : 'tasks');

    const [newTask, setNewTask] = useState('');
    const [savingTask, setSavingTask] = useState(false);
    const [noteTitle, setNoteTitle] = useState(selectedNote?.title || '');
    const [noteContent, setNoteContent] = useState(selectedNote?.content || '');
    const [savingNote, setSavingNote] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Track local active context
    const [activeNoteId, setActiveNoteId] = useState(selectedNote?.id);
    const [activeIsCreating, setActiveIsCreating] = useState(isCreatingNote);

    const tasks = project.shared_tasks || [];
    const notes = project.shared_notes || [];
    const done = tasks.filter(t => t.completed).length;
    const progress = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100);

    const activeDataRef = useRef({ title: noteTitle, content: noteContent, id: activeNoteId, project: project.id });

    // Keep active data updated dynamically
    useEffect(() => {
        activeDataRef.current = { title: noteTitle, content: noteContent, id: activeNoteId, project: project.id };
    }, [noteTitle, noteContent, activeNoteId, project.id]);

    // Debounced autosave on typing
    useEffect(() => {
        const st = activeDataRef.current;
        if (!st.title.trim()) return;

        const timeout = setTimeout(() => {
            if (!savingNote) performAutoSave();
        }, 1500); // Save 1.5 seconds after last keystroke

        return () => clearTimeout(timeout);
    }, [noteTitle, noteContent]); // Trigger whenever title or content changes

    const performAutoSaveHelper = async (st) => {
        if (!st.title.trim()) return;
        try {
            const payload = { title: st.title.trim(), content: st.content, project: st.project };
            if (st.id) {
                await api.patch(`/shared-notes/${st.id}/`, payload);
                onUpdate(true);
            } else {
                await api.post('/shared-notes/', payload);
                onUpdate(true);
            }
        } catch (e) { console.error("AutoSave error:", e); }
    };

    const performAutoSave = async () => {
        const st = activeDataRef.current;
        if (!st.title.trim() || savingNote) return;
        setSavingNote(true);
        try {
            const payload = { title: st.title.trim(), content: st.content, project: st.project };
            if (st.id) {
                await api.patch(`/shared-notes/${st.id}/`, payload);
                onUpdate(true);
            } else {
                const res = await api.post('/shared-notes/', payload);
                st.id = res.id;
                setActiveNoteId(res.id);
                setSelectedNote(res);
                setIsCreatingNote(false);
                onUpdate(true);
            }
        } catch (e) { console.error("AutoSave error:", e); }
        finally { setSavingNote(false); }
    };

    useEffect(() => {
        if (selectedNote?.id !== activeNoteId || isCreatingNote !== activeIsCreating || project.id !== activeDataRef.current.project) {

            // If changing context, save the previous one.
            if (activeDataRef.current.id || activeDataRef.current.title.trim()) {
                performAutoSaveHelper(activeDataRef.current);
            }

            // Apply new context!
            setNoteTitle(selectedNote?.title || '');
            setNoteContent(selectedNote?.content || '');
            setConfirmDelete(false);
            setActiveNoteId(selectedNote?.id);
            setActiveIsCreating(isCreatingNote);
            if (selectedNote || isCreatingNote) {
                setTab('notes');
            } else if (project.id !== activeDataRef.current.project) {
                setTab('tasks');
            }
        }
    }, [selectedNote, isCreatingNote, activeNoteId, activeIsCreating, project.id]);

    useEffect(() => {
        const handleVisibility = () => { if (document.hidden) performAutoSave(); };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            // Also need to save on unmount!
            performAutoSaveHelper(activeDataRef.current);
        };
    }, []);

    const handleSwitchNote = async (n) => {
        // Enforce save logic locally before navigating inside ProjectDetail
        await performAutoSaveHelper(activeDataRef.current);
        if (n) {
            setSelectedNote(n); setIsCreatingNote(false);
        } else {
            setSelectedNote(null); setIsCreatingNote(true);
        }
    };

    const handleCloseNote = async () => {
        await performAutoSaveHelper(activeDataRef.current);
        setSelectedNote(null);
        setIsCreatingNote(false);
    };

    const openNote = (n) => handleSwitchNote(n);
    const newNote = () => handleSwitchNote(null);

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        setSavingTask(true);
        try { await api.post('/shared-tasks/', { project: project.id, title: newTask.trim() }); setNewTask(''); onUpdate(); }
        catch (e) { console.error(e); } finally { setSavingTask(false); }
    };

    const toggleTask = async (t) => {
        try { await api.patch(`/shared-tasks/${t.id}/`, { completed: !t.completed }); onUpdate(); }
        catch (e) { console.error(e); }
    };

    const deleteTask = async (id) => {
        try { await api.delete(`/shared-tasks/${id}/`); onUpdate(); }
        catch (e) { console.error(e); }
    };

    const deleteNote = async () => {
        if (!confirmDelete) { setConfirmDelete(true); return; }
        try { await api.delete(`/shared-notes/${selectedNote.id}/`); setSelectedNote(null); setIsCreatingNote(false); onUpdate(); }
        catch (e) { console.error(e); } finally { setConfirmDelete(false); }
    };

    // useEffect automatically opening notes[0] was removed.

    const handleTabChange = async (newTab) => {
        const isCurrentlyOpen = selectedNote || isCreatingNote;
        if (tab === 'notes' && newTab !== 'notes' && isCurrentlyOpen) {
            await performAutoSave();
            onUpdate();
        }
        setTab(newTab);
    };

    return (
        <div className={`flex-1 flex flex-col min-w-0 overflow-hidden animate-in fade-in slide-in-from-right-2 duration-200 ${s.mainBg}`}>

            {/* Breadcrumb / header */}
            {!(selectedNote || isCreatingNote) && (
                <>
                    <div className={`flex items-center justify-between px-4 md:px-8 py-4 border-b ${s.divider}`}>
                        <div className="flex items-center gap-2 min-w-0">
                            <button onClick={onClose} className={`p-1.5 rounded text-sm ${s.breadBtn} transition-all`}>
                                <ArrowLeft size={16} />
                            </button>
                            <ChevronRight size={14} className={`hidden md:block ${s.muted}`} />
                            <FolderOpen size={16} className={`hidden md:block ${s.subtle}`} />
                            <span className={`text-sm font-medium truncate ${s.text}`}>{project.name}</span>
                        </div>
                        <button onClick={onUpdate} className={`p-1.5 rounded ${s.refreshBtn} transition-all`}>
                            <RefreshCw size={14} />
                        </button>
                    </div>

                    {/* Page header (Notion style) */}
                    <div className="px-6 md:px-16 pt-8 md:pt-12 pb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <FolderOpen size={36} className={s.titleIcon} />
                        </div>
                        <h1 className={`text-4xl font-bold tracking-tight mb-2 ${s.titleCls}`}>
                            {project.name}
                        </h1>
                        {project.description && (
                            <p className={`text-base mt-1 ${s.muted}`}>{project.description}</p>
                        )}
                        <div className={`flex items-center gap-6 mt-4 text-sm ${s.muted}`}>
                            <span>Creado por <span className="font-medium">{project.created_by_name}</span></span>
                            <span>·</span>
                            <div className="flex items-center gap-2">
                                <span>{progress}% completado</span>
                                <div className="w-24"><ProgressBar progress={progress} /></div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className={`flex gap-0 border-b ${s.divider} px-6 md:px-16 overflow-x-auto`}>
                        {[
                            { key: 'tasks', label: 'Tareas', Icon: ClipboardList, count: tasks.length },
                            { key: 'notes', label: 'Notas', Icon: BookOpen, count: notes.length },
                        ].map(({ key, label, Icon: TabIcon, count }) => (
                            <button key={key} onClick={() => handleTabChange(key)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all
                            ${tab === key ? s.tabActive : s.tabDefault}`}>
                                <TabIcon size={15} />
                                {label}
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-normal
                            ${tab === key ? s.tabBadgeActive : s.tabBadgeDefault}`}>{count}</span>
                            </button>
                        ))}
                    </div>
                </>)}

            {/* Tab content */}
            <div className="flex-1 overflow-hidden relative">
                {(tab === 'tasks' && !selectedNote && !isCreatingNote) ? (
                    // ── Tasks ──
                    <div className={`flex-1 overflow-y-auto px-6 md:px-16 py-8 ${s.scrollCls}`}>
                        <div className="max-w-2xl space-y-1">
                            {[...tasks].sort((a, b) => {
                                if (a.completed !== b.completed) return a.completed ? 1 : -1;
                                return new Date(a.created_at) - new Date(b.created_at);
                            }).map(task => (
                                <div key={task.id}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-all ${s.taskHover}`}>
                                    <button onClick={() => toggleTask(task)}
                                        className={`w-4 h-4 flex-shrink-0 rounded flex items-center justify-center border transition-all
                                            ${task.completed ? s.checkDone : s.checkUndone}`}>
                                        {task.completed && <Check size={10} color={s.checkColor} strokeWidth={3} />}
                                    </button>
                                    <span className={`flex-1 text-sm ${task.completed ? `line-through ${s.muted}` : s.text}`}>{task.title}</span>
                                    <span className={`text-xs ${s.muted} opacity-0 group-hover:opacity-100 transition-opacity`}>{task.created_by_name}</span>
                                    <button onClick={() => deleteTask(task.id)}
                                        className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${s.taskDeleteCls}`}>
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            ))}

                            {tasks.length === 0 && (
                                <p className={`text-sm py-4 ${s.muted}`}>Sin tareas. Añade la primera abajo.</p>
                            )}

                            <form onSubmit={addTask} className="mt-2">
                                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 border-dashed transition-all ${s.taskAddBorder}`}>
                                    <Plus size={14} className={s.muted} />
                                    <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)}
                                        placeholder="Añadir tarea..."
                                        className={`flex-1 bg-transparent outline-none text-sm ${s.text}`} />
                                    {newTask.trim() && (
                                        <button type="submit" disabled={savingTask}
                                            className={`px-3 py-1 text-xs rounded ${s.btnPrimary} disabled:opacity-40`}>
                                            Añadir
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    // ── Notes ──
                    <div className="flex-1 flex overflow-hidden">
                        {!selectedNote && !isCreatingNote ? (
                            // Notes list View
                            <div className={`flex-1 overflow-y-auto px-6 md:px-16 py-8 ${s.scrollCls}`}>
                                <div className="max-w-4xl mx-auto">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <BookOpen size={24} className={s.iconAccent} />
                                            <h2 className={`text-2xl font-bold tracking-tight ${s.text}`}>Páginas</h2>
                                        </div>
                                        <button onClick={newNote} className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg ${s.btnPrimary}`}>
                                            <Plus size={15} /> Nueva página
                                        </button>
                                    </div>

                                    {notes.length === 0 ? (
                                        <div className={`flex flex-col items-center justify-center gap-4 text-center py-20 rounded-xl border-2 border-dashed ${s.emptyBorder}`}>
                                            <FileText size={48} className={`opacity-40 ${s.emptyIcon}`} />
                                            <div>
                                                <p className={`font-semibold ${s.subtle}`}>Sin páginas</p>
                                                <p className={`text-sm mt-1 ${s.muted}`}>Crea la primera página en este proyecto</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {notes.map(note => (
                                                <button key={note.id} onClick={() => openNote(note)}
                                                    className={`text-left p-5 rounded-xl border transition-all group hover:-translate-y-0.5 hover:shadow-md ${s.cardBg} ${s.cardHover}`}>
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <FileText size={18} className={s.iconMuted} />
                                                        <h3 className={`font-semibold text-base truncate ${s.text}`}>{note.title}</h3>
                                                    </div>
                                                    <p className={`text-sm ${s.muted} line-clamp-3 min-h-[60px]`}>
                                                        {note.content ? note.content.replace(/<[^>]+>/g, '').substring(0, 100) : 'Sin contenido...'}
                                                    </p>
                                                    <div className={`mt-4 pt-3 border-t ${s.divider} flex items-center justify-between text-xs ${s.muted}`}>
                                                        <span>{note.created_by_name}</span>
                                                        <span>{fmtDate(note.updated_at)}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Note editor/viewer
                            <div className={`flex-1 flex flex-col overflow-hidden ${s.mainBg}`}>
                                {/* Note toolbar */}
                                <div className={`flex items-center justify-between px-4 md:px-8 py-3 border-b ${s.divider}`}>
                                    <div className="flex items-center gap-2">
                                        <button onClick={handleCloseNote} className={`p-1.5 mr-1 rounded ${s.breadBtn}`}>
                                            <ArrowLeft size={16} />
                                        </button>
                                        <span className={`text-xs ${s.muted}`}>
                                            {savingNote ? 'Guardando...' : 'Guardado automático'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {selectedNote && (
                                            <span className={`text-xs ${s.muted}`}>
                                                por {selectedNote.created_by_name} · {fmtDate(selectedNote.updated_at)}
                                            </span>
                                        )}
                                        {selectedNote && (
                                            <button onClick={deleteNote}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg ${s.btnDanger}`}>
                                                <Trash2 size={12} />
                                                {confirmDelete ? '¿Confirmar?' : 'Eliminar'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Note content */}
                                <div className={`flex-1 overflow-y-auto px-6 md:px-16 py-6 md:py-10 ${s.scrollCls}`}>
                                    <div className="max-w-2xl mx-auto h-full flex flex-col">
                                        <input value={noteTitle} onChange={e => setNoteTitle(e.target.value)}
                                            onKeyDown={e => { if (e.ctrlKey && e.key.toLowerCase() === 'g') { e.preventDefault(); performAutoSave(); } }}
                                            placeholder="Título"
                                            className={`w-full text-3xl font-bold bg-transparent outline-none mb-6 ${s.contentTitle}`} />

                                        <div className="flex-1 min-h-0">
                                            <TiptapEditor
                                                key={activeNoteId || 'new'}
                                                initialContent={noteContent}
                                                onUpdate={setNoteContent}
                                                onSave={performAutoSave}
                                                theme={theme}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Community Panel ───────────────────────────────────────────────────────────
const CommunityPanel = ({ community, currentUserId, theme, onUpdate, onCreateProject, onClose, selectedProject, setSelectedProject, selectedNote, setSelectedNote, isCreatingNote, setIsCreatingNote }) => {
    const s = useStyles(theme);
    const [addInput, setAddInput] = useState('');
    const [addError, setAddError] = useState('');
    const [adding, setAdding] = useState(false);

    const [projectData, setProjectData] = useState(null);
    const [loadingProject, setLoadingProject] = useState(false);

    const isOwner = community.owner === currentUserId;

    const fetchProject = useCallback(async (id, silent = false) => {
        if (!silent) setLoadingProject(true);
        try { const data = await api.get(`/shared-projects/${id}/`); setProjectData(data); }
        catch (e) { console.error(e); } finally { if (!silent) setLoadingProject(false); }
    }, []);

    const selectProject = async (p) => { setSelectedProject(p); };

    useEffect(() => {
        if (selectedProject && selectedProject.id !== projectData?.id && !loadingProject) {
            fetchProject(selectedProject.id);
        } else if (!selectedProject) {
            setProjectData(null);
        }
    }, [selectedProject, projectData, loadingProject, fetchProject]);

    const handleUpdate = async (silent = false) => { if (selectedProject) await fetchProject(selectedProject.id, silent); onUpdate(silent); };

    const [addSuccess, setAddSuccess] = useState('');
    const [kickTarget, setKickTarget] = useState(null); // { username, displayName }
    const [kicking, setKicking] = useState(false);

    const addMember = async () => {
        if (!addInput.trim()) return;
        setAdding(true); setAddError(''); setAddSuccess('');
        try {
            const res = await api.post(`/communities/${community.id}/add_member/`, { username: addInput.trim() });
            setAddInput('');
            setAddSuccess(res.detail || 'Invitación enviada');
            setTimeout(() => setAddSuccess(''), 4000);
        }
        catch (e) { setAddError(e.message || 'Usuario no encontrado'); } finally { setAdding(false); }
    };

    // Step 1: open confirmation modal
    const askKick = (member) => {
        setKickTarget({ username: member.username, displayName: member.display_name || member.username });
    };

    // Step 2: confirmed → call API
    const confirmKick = async () => {
        if (!kickTarget) return;
        setKicking(true);
        try {
            await api.post(`/communities/${community.id}/remove_member/`, { username: kickTarget.username });
            onUpdate();
        } catch (e) { console.error(e); }
        finally { setKicking(false); setKickTarget(null); }
    };

    useEffect(() => { setSelectedProject(null); setProjectData(null); setAddInput(''); setAddError(''); setAddSuccess(''); setKickTarget(null); }, [community.id]);

    // ── Kick confirmation modal ────────────────────────────────────────────────
    const kickModalBg = t4(theme, {
        cyberpunk: 'bg-cyber-dark border border-cyber-primary/40 shadow-[0_0_40px_rgba(255,0,85,0.2)]',
        paper: 'bg-white border-2 border-neutral-200 shadow-2xl sketchy-box',
        dark: 'bg-dark-surface border border-dark-border shadow-[0_8px_48px_rgba(0,0,0,0.6)]',
        sakura: 'bg-white border border-sakura-blossom/50 shadow-[0_8px_48px_rgba(232,87,122,0.18)] sakura-card',
    });
    const kickOverlay = t4(theme, {
        cyberpunk: 'bg-black/60 backdrop-blur-sm',
        paper: 'bg-black/20 backdrop-blur-[2px]',
        dark: 'bg-black/70 backdrop-blur-sm',
        sakura: 'bg-sakura-ink/20 backdrop-blur-sm',
    });
    const kickAvatarBg = t4(theme, {
        cyberpunk: 'bg-red-500/15 border border-red-500/40',
        paper: 'bg-red-50 border border-red-200',
        dark: 'bg-red-950/50 border border-red-800/50',
        sakura: 'bg-red-50 border border-red-200',
    });
    const kickTitleCls = t4(theme, { cyberpunk: 'text-cyber-secondary', paper: 'text-neutral-900', dark: 'text-dark-text', sakura: 'text-sakura-ink' });
    const kickBodyCls = t4(theme, { cyberpunk: 'text-cyber-secondary/60', paper: 'text-neutral-500', dark: 'text-dark-muted', sakura: 'text-sakura-muted' });
    const kickNameCls = t4(theme, { cyberpunk: 'text-cyber-primary font-bold', paper: 'text-neutral-900 font-bold', dark: 'text-dark-text font-bold', sakura: 'text-sakura-ink font-bold' });
    const kickDivider = t4(theme, { cyberpunk: 'border-cyber-primary/15', paper: 'border-neutral-100', dark: 'border-dark-border', sakura: 'border-sakura-blossom/20' });
    const kickConfirmBtn = t4(theme, {
        cyberpunk: 'bg-red-600/20 border border-red-500/60 text-red-400 hover:bg-red-500/30 hover:border-red-400 shadow-[0_0_8px_rgba(255,0,0,0.2)]',
        paper: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
        dark: 'bg-red-700/80 text-white hover:bg-red-600/80 rounded-lg',
        sakura: 'bg-red-500 text-white hover:bg-red-600 rounded-xl shadow-sm',
    });
    const kickCancelBtn = t4(theme, {
        cyberpunk: 'border border-cyber-secondary/30 text-cyber-secondary/60 hover:bg-cyber-secondary/10',
        paper: 'border border-neutral-200 text-neutral-600 hover:bg-neutral-50',
        dark: 'border border-dark-border text-dark-muted hover:bg-dark-elevated rounded-lg',
        sakura: 'border border-sakura-blossom/40 text-sakura-muted hover:bg-sakura-petal/30 rounded-xl',
    });
    const kickCloseBtnCls = t4(theme, {
        cyberpunk: 'text-cyber-secondary/40 hover:text-cyber-secondary hover:bg-cyber-primary/10',
        paper: 'text-neutral-300 hover:text-neutral-500 hover:bg-neutral-100',
        dark: 'text-dark-border hover:text-dark-muted hover:bg-dark-elevated',
        sakura: 'text-sakura-muted/50 hover:text-sakura-muted hover:bg-sakura-petal/30',
    });

    const KickModal = kickTarget ? (
        <div
            className={`fixed inset-0 z-[500] flex items-center justify-center p-4 ${kickOverlay}`}
            onClick={(e) => e.target === e.currentTarget && !kicking && setKickTarget(null)}
        >
            <div className={`w-full max-w-sm rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${kickModalBg}`}>
                {/* Header */}
                <div className={`flex items-center justify-between px-5 py-4 border-b ${kickDivider}`}>
                    <span className={`text-sm font-semibold ${kickTitleCls}`}>Expulsar miembro</span>
                    <button
                        onClick={() => !kicking && setKickTarget(null)}
                        className={`p-1 rounded-lg transition-all ${kickCloseBtnCls}`}
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-6 flex flex-col items-center gap-4 text-center">
                    {/* Avatar with danger ring */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black ${kickAvatarBg}`}
                        style={{ color: `hsl(${Array.from(kickTarget.displayName).reduce((h, c) => (h * 31 + c.charCodeAt(0)) & 0xffff, 0) % 360}, 55%, 50%)` }}>
                        {kickTarget.displayName[0].toUpperCase()}
                    </div>

                    <div>
                        <p className={`text-base ${kickTitleCls}`}>
                            ¿Expulsar a <span className={kickNameCls}>@{kickTarget.username}</span>?
                        </p>
                        <p className={`text-sm mt-1.5 leading-relaxed ${kickBodyCls}`}>
                            Esta persona perderá acceso a todos los proyectos y notas de la comunidad.
                            Podrás volver a invitarla más adelante.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className={`flex gap-2.5 px-5 pb-5`}>
                    <button
                        onClick={() => setKickTarget(null)}
                        disabled={kicking}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all border ${kickCancelBtn} disabled:opacity-50`}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={confirmKick}
                        disabled={kicking}
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all border ${kickConfirmBtn} disabled:opacity-50`}
                    >
                        {kicking ? 'Expulsando...' : '🚫 Expulsar'}
                    </button>
                </div>
            </div>
        </div>
    ) : null;

    if (selectedProject) {
        if (loadingProject) {
            return (
                <div className={`flex-1 flex items-center justify-center ${s.mainBg}`}>
                    <RefreshCw size={24} className={`animate-spin ${s.muted}`} />
                </div>
            );
        }
        if (projectData) {
            return <ProjectDetail key={projectData.id} project={projectData} theme={theme}
                onUpdate={handleUpdate} onClose={() => { setSelectedProject(null); setProjectData(null); setSelectedNote(null); setIsCreatingNote(false); }} selectedNote={selectedNote} setSelectedNote={setSelectedNote} isCreatingNote={isCreatingNote} setIsCreatingNote={setIsCreatingNote} />;
        }
    }

    return (
        <div className={`flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200 ${s.mainBg}`}>
            {/* Kick confirmation modal */}
            {KickModal}
            {/* Page header */}
            <div className={`flex items-center gap-3 px-4 md:px-8 py-4 border-b ${s.divider}`}>
                <button onClick={onClose} className={`md:hidden p-1.5 -ml-2 rounded ${s.breadBtn}`}>
                    <ArrowLeft size={16} />
                </button>
                <Globe size={16} className={`hidden md:block ${s.subtle}`} />
                <span className={`text-sm font-medium ${s.text}`}>{community.name}</span>
                <span className={s.muted}>·</span>
                <span className={`text-sm ${s.muted}`}>{community.member_count} miembro{community.member_count !== 1 ? 's' : ''}</span>
            </div>

            <div className={`flex-1 overflow-y-auto ${s.scrollCls}`}>
                <div className="px-6 md:px-16 pt-8 md:pt-12 pb-16 max-w-4xl">

                    {/* Community title */}
                    <div className="flex items-center gap-3 mb-1">
                        <Globe size={42} className={s.titleIcon} />
                    </div>
                    <h1 className={`text-4xl font-bold tracking-tight mb-2 ${s.titleCls}`}>
                        {community.name}
                    </h1>
                    {community.description && <p className={`text-base ${s.muted} mb-8`}>{community.description}</p>}

                    <div className={`border-t ${s.divider} mb-10`} />

                    {/* Projects */}
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <Layers size={16} className={s.subtle} />
                                <h2 className={`text-sm font-semibold uppercase tracking-wider ${s.subtle}`}>Proyectos</h2>
                            </div>
                            <button onClick={() => onCreateProject(community.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg ${s.btnPrimary}`}>
                                <Plus size={13} /> Nuevo proyecto
                            </button>
                        </div>

                        {community.projects.length === 0 ? (
                            <div className={`text-center py-14 rounded-xl border-2 border-dashed ${s.emptyBorder}`}>
                                <FolderOpen size={32} className="mx-auto mb-3 opacity-40" />
                                <p className="font-medium text-sm">Sin proyectos</p>
                                <p className="text-xs mt-1">Crea el primer proyecto compartido</p>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {community.projects.map(project => {
                                    const prog = project.progress || 0;
                                    const tCount = (project.shared_tasks || []).length;
                                    const nCount = (project.shared_notes || []).length;
                                    return (
                                        <button key={project.id} onClick={() => selectProject(project)}
                                            className={`text-left p-5 rounded-xl border transition-all group hover:-translate-y-0.5 hover:shadow-md
                                                ${s.cardBg} ${s.cardHover}`}>
                                            <div className="flex items-start justify-between mb-3">
                                                <FolderOpen size={20} className={s.iconMuted} />
                                                <span className={`text-xs font-medium ${s.muted}`}>{Math.round(prog)}%</span>
                                            </div>
                                            <h3 className={`font-semibold text-sm mb-1 group-hover:translate-x-0.5 transition-transform ${s.text}`}>{project.name}</h3>
                                            {project.description && <p className={`text-xs mb-3 ${s.muted} line-clamp-2`}>{project.description}</p>}
                                            <ProgressBar progress={prog} />
                                            <div className={`flex items-center gap-3 mt-3 text-xs ${s.muted}`}>
                                                <span className="flex items-center gap-1"><CheckSquare size={11} /> {tCount}</span>
                                                <span className="flex items-center gap-1"><FileText size={11} /> {nCount}</span>
                                                <span className="flex items-center gap-1"><Edit3 size={11} /> {project.created_by_name}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Members */}
                    <section>
                        <div className="flex items-center gap-2 mb-5">
                            <Users size={16} className={s.subtle} />
                            <h2 className={`text-sm font-semibold uppercase tracking-wider ${s.subtle}`}>Miembros</h2>
                        </div>

                        <div className="space-y-1 mb-4">
                            {community.members.map(member => (
                                <div key={member.id} className={`flex items-center justify-between px-4 py-3 rounded-xl ${s.memberBg}`}>
                                    <div className="flex items-center gap-3">
                                        <Avatar name={member.display_name || member.username} size={32} theme={theme} />
                                        <div>
                                            <div className={`text-sm font-medium ${s.text}`}>{member.display_name || member.username}</div>
                                            {member.display_name && <div className={`text-xs ${s.muted}`}>@{member.username}</div>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {member.id === community.owner && (
                                            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${s.ownerBadge}`}>
                                                <Crown size={10} /> Owner
                                            </span>
                                        )}
                                        {isOwner && member.id !== community.owner && (
                                            <button onClick={() => askKick(member)}
                                                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${s.btnDanger}`}>
                                                <UserMinus size={11} /> Quitar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {isOwner && (
                            <div className="flex gap-2 mt-4">
                                <div className="flex-1 relative">
                                    <input value={addInput} onChange={e => { setAddInput(e.target.value); setAddError(''); }}
                                        onKeyDown={e => e.key === 'Enter' && addMember()}
                                        placeholder="Username del miembro..."
                                        className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg ${s.inputCls}`} />
                                    <UserPlus size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${s.muted}`} />
                                </div>
                                <button onClick={addMember} disabled={adding || !addInput.trim()}
                                    className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg ${s.btnPrimary} disabled:opacity-40`}>
                                    <UserPlus size={14} /> {adding ? '...' : 'Agregar'}
                                </button>
                            </div>
                        )}
                        {addError && <p className="mt-2 text-xs text-red-400 flex items-center gap-1"><X size={11} /> {addError}</p>}
                        {addSuccess && <p className="mt-2 text-xs text-emerald-500 flex items-center gap-1"><Check size={11} /> {addSuccess}</p>}
                    </section>
                </div>
            </div>
        </div>
    );
};

// ── Main CommunityView ────────────────────────────────────────────────────────
export default function CommunityView() {
    const { theme } = useTheme();
    const { user } = useUser();
    const s = useStyles(theme);

    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [modalCreate, setModalCreate] = useState(false);
    const [modalProject, setModalProject] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedNote, setSelectedNote] = useState(null);
    const [isCreatingNote, setIsCreatingNote] = useState(false);


    const fetchAll = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await api.get('/communities/');
            setCommunities(data);
            if (selected) {
                const updated = data.find(c => c.id === selected.id);
                if (updated) setSelected(updated);
            }
        } catch (e) { console.error(e); } finally { if (!silent) setLoading(false); }
    }, [selected?.id]);

    useEffect(() => { fetchAll(); }, []);

    const createCommunity = async (values) => {
        try { await api.post('/communities/', { name: values.name, description: values.description }); setModalCreate(false); await fetchAll(true); }
        catch (e) { console.error(e); }
    };

    const createProject = async (values) => {
        try { await api.post('/shared-projects/', { community: modalProject, name: values.name, description: values.description }); setModalProject(null); await fetchAll(true); }
        catch (e) { console.error(e); }
    };

    return (
        <div className={`flex h-full min-h-0 overflow-hidden ${s.rootCls}`}>

            {/* Modals */}
            {modalCreate && (
                <Modal theme={theme} title="Nueva comunidad" primaryText="Crear" onClose={() => setModalCreate(false)} onSave={createCommunity}
                    fields={[
                        { key: 'name', label: 'Nombre', placeholder: 'Mi equipo...', required: true, autoFocus: true },
                        { key: 'description', label: 'Descripción', placeholder: '¿De qué trata?', multiline: true },
                    ]} />
            )}
            {modalProject && (
                <Modal theme={theme} title="Nuevo proyecto" primaryText="Crear" onClose={() => setModalProject(null)} onSave={createProject}
                    fields={[
                        { key: 'name', label: 'Nombre del proyecto', placeholder: 'Proyecto increíble...', required: true, autoFocus: true },
                        { key: 'description', label: 'Descripción', placeholder: '¿En qué consiste?', multiline: true },
                    ]} />
            )}

            {/* Sidebar */}
            <aside className={`w-full md:w-60 flex-shrink-0 flex flex-col border-r ${s.divider} ${s.panelBg} overflow-hidden ${selected ? 'hidden md:flex' : ''}`}>
                {/* Sidebar header */}
                <div className={`px-4 py-4 border-b ${s.divider}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Globe size={16} className={s.iconAccent} />
                            <span className={`text-sm font-semibold ${s.text}`}>Comunidades</span>
                        </div>
                        <button onClick={() => setModalCreate(true)}
                            className={`p-1 rounded transition-all ${s.plusBtnCls}`}>
                            <Plus size={15} />
                        </button>
                    </div>
                </div>

                {/* Community list */}
                <div className={`flex-1 overflow-y-auto py-2 ${s.scrollCls}`}>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw size={16} className={`animate-spin ${s.muted}`} />
                        </div>
                    ) : communities.length === 0 ? (
                        <div className="px-4 py-6 text-center">
                            <Globe size={24} className={`mx-auto mb-2 ${s.muted}`} />
                            <p className={`text-xs ${s.muted}`}>Sin comunidades aún</p>
                            <button onClick={() => setModalCreate(true)} className={`mt-3 px-3 py-1.5 text-xs rounded-lg ${s.btnPrimary}`}>Crear una</button>
                        </div>
                    ) : (
                        <div className="px-2 space-y-0.5">
                            {communities.map(c => {
                                const isActive = selected?.id === c.id;
                                return (

                                    <div key={c.id}>
                                        <button onClick={() => { setSelected(c); setSelectedProject(null); setSelectedNote(null); setIsCreatingNote(false); }}
                                            className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${s.sidebarItem(isActive)}`}>
                                            <Avatar name={c.name} size={20} theme={theme} />
                                            <span className="truncate font-medium text-sm">{c.name}</span>

                                            {c.owner === user?.id && <Crown size={10} className={`flex-shrink-0 ${s.crownCls}`} />}
                                        </button>
                                        {isActive && c.projects?.length > 0 && (
                                            <div className="mt-1 mb-2 space-y-1">
                                                {c.projects.map(p => (
                                                    <div key={p.id} className="pl-4 border-l border-white/10 ml-5 py-0.5">

                                                        <button
                                                            onClick={() => { setSelectedProject(p); setSelectedNote(null); setIsCreatingNote(false); }}
                                                            className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors hover:text-white ${selectedProject?.id === p.id ? 'text-white font-medium bg-white/5' : s.muted}`}>
                                                            <FolderOpen size={13} className={selectedProject?.id === p.id ? 'text-cyber-primary' : 'opacity-70'} />
                                                            <span className="truncate">{p.name}</span>
                                                        </button>
                                                        {selectedProject?.id === p.id && (
                                                            <div className="mt-1.5 flex flex-col gap-0.5 relative before:absolute before:left-[10px] before:top-0 before:bottom-3 before:w-px before:bg-white/10">
                                                                <div className="pl-6 text-[9px] font-bold uppercase tracking-widest opacity-40 mb-1">Páginas</div>
                                                                {(p.shared_notes || []).map(note => (
                                                                    <button key={note.id} onClick={(e) => { e.stopPropagation(); setSelectedNote(note); setIsCreatingNote(false); setTimeout(() => document.querySelector('.tiptap-wrapper')?.scrollIntoView({ behavior: 'smooth' }), 50); }}
                                                                        className={`w-full text-left flex items-center gap-2 pl-6 pr-2 py-1.5 rounded-md text-[11px] font-medium transition-all group ${selectedNote?.id === note.id ? 'bg-cyber-primary text-black' : 'text-cyber-secondary/70 hover:bg-cyber-primary/10 hover:text-cyber-secondary'}`}>
                                                                        <FileText size={11} className={`flex-shrink-0 ${selectedNote?.id === note.id ? 'opacity-100' : 'opacity-60'}`} />
                                                                        <span className="truncate">{note.title}</span>
                                                                    </button>
                                                                ))}
                                                                <button onClick={(e) => { e.stopPropagation(); setSelectedNote(null); setIsCreatingNote(true); }}
                                                                    className={`w-full text-left flex items-center gap-2 pl-6 pr-2 py-1.5 rounded-md text-[11px] transition-all group text-cyber-secondary/50 hover:bg-cyber-primary/10 hover:text-cyber-secondary`}>
                                                                    <Plus size={11} className="flex-shrink-0 opacity-60 group-hover:opacity-100" />
                                                                    <span className="truncate opacity-80 group-hover:opacity-100">Nueva página</span>
                                                                </button>

                                                                <div className="pl-6 text-[9px] font-bold uppercase tracking-widest opacity-40 mt-3 mb-1">Acciones</div>
                                                                <button onClick={(e) => { e.stopPropagation(); setSelectedNote(null); setIsCreatingNote(false); }}
                                                                    className={`w-full text-left flex items-center gap-2 pl-6 pr-2 py-1.5 rounded-md text-[11px] transition-all group text-cyber-secondary/60 hover:bg-cyber-primary/10 hover:text-cyber-secondary`}>
                                                                    <CheckSquare size={11} className="flex-shrink-0 opacity-60 group-hover:opacity-100" />
                                                                    <span className="truncate opacity-80 group-hover:opacity-100">Ver tareas / ajustes</span>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Sidebar footer */}
                <div className={`px-4 py-3 border-t ${s.divider}`}>
                    <button onClick={() => setModalCreate(true)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all ${s.noteSideFooter}`}>
                        <Plus size={13} /> Nueva comunidad
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className={`flex-1 overflow-hidden ${!selected ? 'hidden md:flex' : 'flex'}`}>
                {!selected ? (
                    <div className={`flex-1 flex flex-col items-center justify-center gap-5 text-center px-8 ${s.mainBg}`}>
                        <Globe size={64} className={s.emptyIcon} />
                        <div>
                            <p className={`text-lg font-semibold ${s.subtle}`}>Selecciona una comunidad</p>
                            <p className={`text-sm mt-1 ${s.muted}`}>O crea una nueva para empezar a colaborar</p>
                        </div>
                        <button onClick={() => setModalCreate(true)} className={`flex items-center gap-2 px-5 py-2.5 text-sm rounded-lg ${s.btnPrimary}`}>
                            <Plus size={15} /> Nueva comunidad
                        </button>
                    </div>
                ) : (
                    <CommunityPanel key={selected.id} community={selected} currentUserId={user?.id} theme={theme}
                        onUpdate={() => fetchAll(true)} onCreateProject={(id) => setModalProject(id)} onClose={() => setSelected(null)} selectedProject={selectedProject} setSelectedProject={setSelectedProject} selectedNote={selectedNote} setSelectedNote={setSelectedNote} isCreatingNote={isCreatingNote} setIsCreatingNote={setIsCreatingNote} />
                )}
            </main>
        </div>
    );
}
