import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Plus, Search, FileText, Trash2, Tag, ArrowLeft
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import TiptapEditor from '../components/TiptapEditor';

const NOTE_TYPES = ['Personal', 'Clase', 'Trabajo', 'Ideas', 'Otro'];

// Theme-aware helper
const t4 = (theme, map) => map[theme] || map.cyberpunk;

const NOTE_TYPE_COLORS = {
    Personal: {
        cyberpunk: 'text-cyber-primary border-cyber-primary/50 bg-cyber-primary/10',
        paper: 'bg-blue-50 border-blue-200 text-blue-700',
        dark: 'text-dark-primary border-dark-primary/40 bg-dark-primary/10',
        sakura: 'text-sakura-deep border-sakura-deep/40 bg-sakura-deep/10',
    },
    Clase: {
        cyberpunk: 'text-cyber-secondary border-cyber-secondary/50 bg-cyber-secondary/10',
        paper: 'bg-green-50 border-green-200 text-green-700',
        dark: 'text-dark-accent border-dark-accent/40 bg-dark-accent/10',
        sakura: 'text-sakura-green border-sakura-green/40 bg-sakura-green/10',
    },
    Trabajo: {
        cyberpunk: 'text-cyber-accent border-cyber-accent/50 bg-cyber-accent/10',
        paper: 'bg-purple-50 border-purple-200 text-purple-700',
        dark: 'text-dark-success border-dark-success/40 bg-dark-success/10',
        sakura: 'text-sakura-gold border-sakura-gold/40 bg-sakura-gold/10',
    },
    Ideas: {
        cyberpunk: 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10',
        paper: 'bg-amber-50 border-amber-200 text-amber-700',
        dark: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
        sakura: 'text-sakura-blossom border-sakura-blossom/50 bg-sakura-blossom/15',
    },
    Otro: {
        cyberpunk: 'text-gray-400 border-gray-600/50 bg-gray-600/10',
        paper: 'bg-neutral-50 border-neutral-200 text-neutral-600',
        dark: 'text-dark-muted border-dark-border bg-dark-elevated',
        sakura: 'text-sakura-muted border-sakura-petal bg-sakura-petal/30',
    },
};

const fmtDate = (d) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
const truncate = (s, n) => s && s.length > n ? s.slice(0, n) + '...' : (s || '');

export default function NotesView() {
    const { theme } = useTheme();

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('Todos');
    const [selectedNote, setSelectedNote] = useState(null);
    const [isCreatingNote, setIsCreatingNote] = useState(false);

    const [formTitle, setFormTitle] = useState('');
    const [formContent, setFormContent] = useState('');
    const [formType, setFormType] = useState('Personal');
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // ── Theme tokens ──
    const divider = t4(theme, { cyberpunk: 'border-cyber-primary/15', paper: 'border-neutral-200', dark: 'border-dark-border', sakura: 'border-sakura-blossom/30' });
    const text = t4(theme, { cyberpunk: 'text-cyber-secondary', paper: 'text-neutral-800', dark: 'text-dark-text', sakura: 'text-sakura-ink' });
    const muted = t4(theme, { cyberpunk: 'text-cyber-secondary/45', paper: 'text-neutral-400', dark: 'text-dark-muted', sakura: 'text-sakura-muted' });
    const subtle = t4(theme, { cyberpunk: 'text-cyber-secondary/65', paper: 'text-neutral-500', dark: 'text-dark-subtle', sakura: 'text-sakura-subtle' });
    const panelBg = t4(theme, { cyberpunk: 'bg-cyber-dark/95', paper: 'bg-neutral-50', dark: 'bg-dark-surface', sakura: 'bg-sakura-surface' });
    const mainBg = t4(theme, { cyberpunk: 'bg-cyber-black/80', paper: 'bg-white', dark: 'bg-dark-bg', sakura: 'bg-sakura-bg' });
    const scrollCls = t4(theme, { cyberpunk: 'cyber-scrollbar', paper: 'paper-scrollbar', dark: 'dark-scrollbar', sakura: 'sakura-scrollbar' });

    const inputCls = t4(theme, {
        cyberpunk: 'bg-cyber-black/50 border border-cyber-primary/30 text-cyber-secondary placeholder-cyber-secondary/25 focus:border-cyber-primary outline-none transition-all',
        paper: 'bg-white border border-neutral-200 text-neutral-800 placeholder-neutral-300 focus:border-neutral-400 outline-none transition-all',
        dark: 'bg-dark-elevated border border-dark-border text-dark-text placeholder-dark-muted focus:border-dark-primary/50 focus:ring-1 focus:ring-dark-primary/20 outline-none transition-all rounded-lg',
        sakura: 'bg-white border border-sakura-blossom/40 text-sakura-ink placeholder-sakura-muted focus:border-sakura-deep/50 focus:ring-1 focus:ring-sakura-blossom/25 outline-none transition-all rounded-xl',
    });
    const btnPrimary = t4(theme, {
        cyberpunk: 'bg-cyber-primary text-black font-semibold hover:bg-cyber-primary/85 transition-all',
        paper: 'bg-neutral-900 text-white font-semibold hover:bg-neutral-700 transition-all',
        dark: 'bg-dark-primary text-white font-semibold hover:bg-dark-primary/85 transition-all rounded-lg',
        sakura: 'bg-sakura-deep text-white font-semibold hover:bg-sakura-deep/85 transition-all rounded-xl shadow-sm',
    });
    const btnSecondary = t4(theme, {
        cyberpunk: 'border border-cyber-secondary/30 text-cyber-secondary hover:bg-cyber-secondary/10 transition-all',
        paper: 'border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition-all',
        dark: 'border border-dark-border text-dark-subtle hover:bg-dark-elevated hover:text-dark-text transition-all rounded-lg',
        sakura: 'border border-sakura-blossom/40 text-sakura-subtle hover:bg-sakura-petal/40 hover:text-sakura-ink transition-all rounded-xl',
    });
    const btnDanger = t4(theme, {
        cyberpunk: 'border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all',
        paper: 'border border-red-200 text-red-500 hover:bg-red-50 transition-all',
        dark: 'border border-red-900/40 text-red-400 hover:bg-red-950/40 transition-all rounded-lg',
        sakura: 'border border-red-200 text-red-400 hover:bg-red-50 transition-all rounded-xl',
    });

    // ── Filter pill styling ──
    const filterActive = t4(theme, {
        cyberpunk: 'bg-cyber-primary text-black',
        paper: 'bg-neutral-900 text-white',
        dark: 'bg-dark-primary text-white',
        sakura: 'bg-sakura-deep text-white',
    });
    const filterInactive = t4(theme, {
        cyberpunk: 'text-cyber-secondary/50 hover:text-cyber-secondary hover:bg-cyber-primary/10',
        paper: 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100',
        dark: 'text-dark-muted hover:text-dark-text hover:bg-dark-elevated',
        sakura: 'text-sakura-muted hover:text-sakura-ink hover:bg-sakura-petal/40',
    });

    // ── Sidebar item styling ──
    const itemSelected = t4(theme, {
        cyberpunk: 'bg-cyber-primary/12 text-cyber-primary',
        paper: 'bg-neutral-100 text-neutral-900',
        dark: 'bg-dark-primary/12 text-dark-primary',
        sakura: 'bg-sakura-blossom/20 text-sakura-deep',
    });
    const itemDefault = t4(theme, {
        cyberpunk: 'hover:bg-cyber-primary/5 text-cyber-secondary/70 hover:text-cyber-secondary',
        paper: 'hover:bg-neutral-50 text-neutral-600 hover:text-neutral-800',
        dark: 'hover:bg-dark-elevated text-dark-muted hover:text-dark-text',
        sakura: 'hover:bg-sakura-petal/30 text-sakura-muted hover:text-sakura-ink',
    });

    // ── Icon color ──
    const iconAccent = t4(theme, { cyberpunk: 'text-cyber-primary', paper: 'text-neutral-500', dark: 'text-dark-primary', sakura: 'text-sakura-deep' });
    const iconMuted = t4(theme, { cyberpunk: 'text-cyber-secondary/50', paper: 'text-neutral-400', dark: 'text-dark-muted', sakura: 'text-sakura-muted' });
    const plusBtnCls = t4(theme, {
        cyberpunk: 'hover:bg-cyber-primary/10 text-cyber-secondary/50 hover:text-cyber-secondary',
        paper: 'hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700',
        dark: 'hover:bg-dark-elevated text-dark-muted hover:text-dark-text',
        sakura: 'hover:bg-sakura-petal/50 text-sakura-muted hover:text-sakura-ink',
    });

    // ── Title / content colors ──
    const titleCls = t4(theme, { cyberpunk: 'text-cyber-primary', paper: 'text-neutral-900', dark: 'text-dark-text', sakura: 'text-sakura-ink' });
    const titlePlaceholder = t4(theme, { cyberpunk: 'placeholder-cyber-primary/20', paper: 'placeholder-neutral-200', dark: 'placeholder-dark-muted', sakura: 'placeholder-sakura-muted' });
    const contentCls = t4(theme, { cyberpunk: 'text-cyber-secondary/90', paper: 'text-neutral-700', dark: 'text-dark-subtle', sakura: 'text-sakura-ink/80' });
    const contentPlaceholder = t4(theme, { cyberpunk: 'placeholder-cyber-secondary/20', paper: 'placeholder-neutral-300', dark: 'placeholder-dark-muted', sakura: 'placeholder-sakura-muted' });

    const emptyIcon = t4(theme, { cyberpunk: 'text-cyber-primary/15', paper: 'text-neutral-100', dark: 'text-dark-border', sakura: 'text-sakura-blossom/30' });

    // Root container
    const rootCls = t4(theme, {
        cyberpunk: 'bg-cyber-dark text-cyber-secondary font-mono',
        paper: 'bg-white text-neutral-800 font-sans',
        dark: 'bg-dark-bg text-dark-text font-dark',
        sakura: 'bg-sakura-bg text-sakura-ink font-sakura',
    });

    // ── Tag border inactive ──
    const tagInactive = t4(theme, {
        cyberpunk: 'border-cyber-primary/20 text-cyber-secondary/40 hover:border-cyber-primary/40',
        paper: 'border-neutral-200 text-neutral-400 hover:border-neutral-300',
        dark: 'border-dark-border text-dark-muted hover:border-dark-primary/40 hover:text-dark-subtle',
        sakura: 'border-sakura-petal text-sakura-muted hover:border-sakura-blossom hover:text-sakura-subtle',
    });

    // ── API ──
    const fetchNotes = useCallback(async () => {
        try { const data = await api.get('/notes/'); setNotes(data); }
        catch (e) { console.error(e); } finally { setLoading(false); }
    }, []);

    const stateRef = useRef({ title: '', content: '', type: 'Personal', id: null, saving: false });
    useEffect(() => {
        stateRef.current = { title: formTitle, content: formContent, type: formType, id: selectedNote?.id, saving };
    }, [formTitle, formContent, formType, selectedNote, saving]);

    // Debounced autosave on typing
    useEffect(() => {
        const timeout = setTimeout(() => {
            const st = stateRef.current;
            if (st.title.trim() && !st.saving) performAutoSave();
        }, 1500); // Save 1.5 seconds after last keystroke
        return () => clearTimeout(timeout);
    }, [formTitle, formContent, formType]);

    const performAutoSave = async () => {
        const st = stateRef.current;
        if (!st.title.trim() || st.saving) return; // Must have title
        setSaving(true);
        st.saving = true;
        try {
            const payload = { title: st.title.trim(), content: st.content, note_type: st.type };
            if (st.id) {
                const updated = await api.patch(`/notes/${st.id}/`, payload);
                setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
            } else {
                const created = await api.post('/notes/', payload);
                st.id = created.id;
                setSelectedNote(created);
                setNotes(prev => [created, ...prev]);
                fetchNotes(); // ensure state matches server nicely
            }
        } catch (e) { console.error("AutoSave error:", e); }
        finally { setSaving(false); st.saving = false; }
    };

    useEffect(() => {
        const handleVisibility = () => { if (document.hidden) performAutoSave(); };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            performAutoSave();
        };
    }, []);

    useEffect(() => { fetchNotes(); }, [fetchNotes]);
    useEffect(() => { setConfirmDelete(false); }, [selectedNote]);

    const filtered = notes.filter(n => {
        const matchType = filterType === 'Todos' || n.note_type === filterType;
        const q = search.toLowerCase();
        return matchType && (!q || n.title.toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q));
    });

    const handleSwitchNote = async (n) => {
        const isCurrentlyOpen = selectedNote || isCreatingNote;
        if (isCurrentlyOpen) {
            await performAutoSave();
            fetchNotes(); // refresh list with saved note
        }
        if (n) {
            setSelectedNote(n); setFormTitle(n.title); setFormContent(n.content || ''); setFormType(n.note_type); setIsCreatingNote(false);
        } else {
            setSelectedNote(null); setFormTitle(''); setFormContent(''); setFormType('Personal'); setIsCreatingNote(true);
        }
    };

    const openNew = () => handleSwitchNote(null);
    const openNote = (n) => handleSwitchNote(n);

    const deleteNote = async () => {
        if (!confirmDelete) { setConfirmDelete(true); return; }
        try {
            await api.delete(`/notes/${selectedNote.id}/`);
            setNotes(prev => prev.filter(n => n.id !== selectedNote.id));
            setSelectedNote(null); setIsCreatingNote(false);
        } catch (e) { console.error(e); } finally { setConfirmDelete(false); }
    };

    const isDetailOpen = selectedNote || isCreatingNote;

    return (
        <div className={`flex h-full min-h-0 overflow-hidden ${rootCls}`}>

            {/* ── Left Panel ── */}
            <aside className={`w-full md:w-64 flex-shrink-0 flex flex-col border-r ${divider} ${panelBg} overflow-hidden ${isDetailOpen ? 'hidden md:flex' : ''}`}>

                {/* Header */}
                <div className={`px-4 py-4 border-b ${divider}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <FileText size={16} className={iconAccent} />
                            <span className={`text-sm font-semibold ${text}`}>Notas</span>
                        </div>
                        <button id="notes-new-btn" onClick={openNew}
                            className={`p-1 rounded transition-all ${plusBtnCls}`}>
                            <Plus size={15} />
                        </button>
                    </div>
                    {/* Search */}
                    <div className="relative">
                        <Search size={13} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${muted}`} />
                        <input id="notes-search" type="text" placeholder="Buscar..." value={search}
                            onChange={e => setSearch(e.target.value)}
                            className={`w-full pl-8 pr-3 py-1.5 text-sm rounded-lg ${inputCls}`} />
                    </div>
                </div>

                {/* Type filters */}
                <div className={`flex gap-1 px-3 py-2 flex-wrap border-b ${divider}`}>
                    {['Todos', ...NOTE_TYPES].map(t => (
                        <button key={t} onClick={() => setFilterType(t)}
                            className={`px-2 py-0.5 text-xs font-medium rounded-full transition-all
                                ${filterType === t ? filterActive : filterInactive}`}>{t}</button>
                    ))}
                </div>

                {/* Note list */}
                <div className={`flex-1 overflow-y-auto py-1 ${scrollCls}`}>
                    {loading ? (
                        <div className={`p-6 text-center text-xs ${muted} animate-pulse`}>Cargando...</div>
                    ) : filtered.length === 0 ? (
                        <div className={`p-6 text-center text-xs ${muted}`}>Sin resultados</div>
                    ) : (
                        <div className="px-2 space-y-0.5">
                            {filtered.map(note => {
                                const tc = NOTE_TYPE_COLORS[note.note_type] || NOTE_TYPE_COLORS['Otro'];
                                const isSelected = selectedNote?.id === note.id;
                                return (
                                    <button key={note.id} onClick={() => openNote(note)}
                                        className={`w-full text-left flex items-start gap-2.5 px-3 py-2.5 rounded-lg transition-all group
                                            ${isSelected ? itemSelected : itemDefault}`}>
                                        <FileText size={13} className="flex-shrink-0 mt-0.5 opacity-60" />
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm font-medium truncate ${isSelected ? titleCls : ''}`}>
                                                {note.title}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${t4(theme, tc)}`}>
                                                    {note.note_type}
                                                </span>
                                                <span className={`text-xs ${muted}`}>{fmtDate(note.updated_at)}</span>
                                            </div>
                                            {note.content && (
                                                <p className={`text-xs mt-1 ${muted} line-clamp-1`}>{truncate(note.content, 60)}</p>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer count */}
                <div className={`px-4 py-2.5 text-xs border-t ${divider} ${muted}`}>
                    {filtered.length} nota{filtered.length !== 1 ? 's' : ''}
                </div>
            </aside>

            {/* ── Right Panel ── */}
            <main className={`flex-1 flex flex-col overflow-hidden ${mainBg} ${!isDetailOpen ? 'hidden md:flex' : ''}`}>
                {!selectedNote && !isCreatingNote ? (
                    /* Empty state */
                    <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-8">
                        <FileText size={64} className={emptyIcon} />
                        <div>
                            <p className={`text-lg font-semibold ${subtle}`}>Selecciona una nota</p>
                            <p className={`text-sm mt-1 ${muted}`}>O crea una nueva para comenzar</p>
                        </div>
                        <button onClick={openNew} className={`flex items-center gap-2 px-5 py-2.5 text-sm rounded-lg ${btnPrimary}`}>
                            <Plus size={15} /> Nueva nota
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Toolbar */}
                        <div className={`flex items-center justify-between px-4 md:px-8 py-3 border-b ${divider}`}>
                            <div className="flex items-center gap-2">
                                <button onClick={() => { setSelectedNote(null); setIsCreatingNote(false); }} className={`md:hidden p-1.5 mr-1 rounded ${btnSecondary}`}>
                                    <ArrowLeft size={16} />
                                </button>
                                <span className={`text-xs ${muted}`}>
                                    {saving ? 'Guardando...' : 'Guardado automático'}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <Tag size={12} className={muted} />
                                    {NOTE_TYPES.map(t => {
                                        const tc = NOTE_TYPE_COLORS[t];
                                        return (
                                            <button key={t} onClick={() => setFormType(t)}
                                                className={`px-2 py-0.5 text-xs rounded-full border font-medium transition-all
                                                    ${formType === t ? t4(theme, tc) : tagInactive}`}>{t}</button>
                                        );
                                    })}
                                </div>
                                {selectedNote && (
                                    <>
                                        <div className="flex items-center gap-2 ml-2">
                                            <span className={`text-xs ${muted}`}>{fmtDate(selectedNote.updated_at)}</span>
                                        </div>
                                        <button onClick={deleteNote}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg ${btnDanger}`}>
                                            <Trash2 size={12} />
                                            {confirmDelete ? '¿Confirmar?' : 'Eliminar'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Content area — Notion style */}
                        <div className={`flex-1 overflow-y-auto px-6 md:px-16 py-6 md:py-10 ${scrollCls}`}>
                            <div className="max-w-2xl mx-auto h-full flex flex-col">
                                <input id="notes-title-input" type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)}
                                    onKeyDown={e => { if (e.ctrlKey && e.key.toLowerCase() === 'g') { e.preventDefault(); performAutoSave(); } }}
                                    placeholder="Título"
                                    className={`w-full text-3xl font-bold bg-transparent outline-none mb-6 leading-tight ${titleCls} ${titlePlaceholder}`} />

                                <div className="flex-1 min-h-0">
                                    <TiptapEditor
                                        key={selectedNote?.id || 'new'}
                                        initialContent={formContent}
                                        onUpdate={setFormContent}
                                        onSave={performAutoSave}
                                        theme={theme}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
