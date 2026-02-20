import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Check, X, Globe, FolderOpen, FileText, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const t4 = (theme, map) => map[theme] || map.cyberpunk;

const TYPE_CONFIG = {
    community_invite: { emoji: '📨', label: 'Invitación' },
    new_project: { emoji: '📁', label: 'Nuevo proyecto' },
    new_note: { emoji: '📝', label: 'Nueva nota' },
};

const fmtDate = (d) => {
    const diff = Math.floor((Date.now() - new Date(d)) / 1000);
    if (diff < 60) return 'Ahora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
};

export default function NotificationPanel({ isOpen, onClose, theme, onNotificationUpdate }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    // Track per-notification loading state
    const [acting, setActing] = useState({}); // { [id]: 'accept' | 'reject' | 'delete' }
    const panelRef = useRef(null);

    // ── Theme tokens ──────────────────────────────────────────────────────────
    const panelBg = t4(theme, {
        cyberpunk: 'bg-cyber-dark border border-cyber-primary/40 shadow-[0_8px_32px_rgba(255,0,85,0.15)]',
        paper: 'bg-white border-2 border-gray-200 shadow-xl sketchy-box',
        dark: 'bg-dark-surface border border-dark-border shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
        sakura: 'bg-white border border-sakura-blossom/40 shadow-[0_8px_32px_rgba(232,87,122,0.12)]',
    });
    const headerCls = t4(theme, {
        cyberpunk: 'border-b border-cyber-primary/20 bg-cyber-dark',
        paper: 'border-b-2 border-gray-200 bg-gray-50',
        dark: 'border-b border-dark-border bg-dark-elevated',
        sakura: 'border-b border-sakura-blossom/25 bg-sakura-surface',
    });
    const titleCls = t4(theme, { cyberpunk: 'text-cyber-primary', paper: 'text-gray-900', dark: 'text-dark-text', sakura: 'text-sakura-ink' });
    const muted = t4(theme, { cyberpunk: 'text-cyber-secondary/50', paper: 'text-gray-400', dark: 'text-dark-muted', sakura: 'text-sakura-muted' });
    const subtle = t4(theme, { cyberpunk: 'text-cyber-secondary/70', paper: 'text-gray-600', dark: 'text-dark-subtle', sakura: 'text-sakura-subtle' });
    const textCls = t4(theme, { cyberpunk: 'text-cyber-secondary', paper: 'text-gray-800', dark: 'text-dark-text', sakura: 'text-sakura-ink' });
    const itemCls = t4(theme, {
        cyberpunk: 'hover:bg-cyber-primary/5 border-b border-cyber-primary/10',
        paper: 'hover:bg-gray-50 border-b border-gray-100',
        dark: 'hover:bg-dark-elevated/70 border-b border-dark-border/50',
        sakura: 'hover:bg-sakura-petal/20 border-b border-sakura-blossom/10',
    });
    const dotCls = t4(theme, { cyberpunk: 'bg-cyber-primary', paper: 'bg-blue-500', dark: 'bg-dark-primary', sakura: 'bg-sakura-deep' });
    const badgeCls = `${dotCls} text-white`;
    const iconBgCls = t4(theme, {
        cyberpunk: 'bg-cyber-primary/10',
        paper: 'bg-gray-100',
        dark: 'bg-dark-surface border border-dark-border',
        sakura: 'bg-sakura-petal/50',
    });
    const scrollCls = t4(theme, { cyberpunk: 'cyber-scrollbar', paper: '', dark: '', sakura: '' });

    // Invite action buttons
    const acceptCls = t4(theme, {
        cyberpunk: 'bg-cyber-primary/15 text-cyber-primary border border-cyber-primary/40 hover:bg-cyber-primary/25 disabled:opacity-50',
        paper: 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50',
        dark: 'bg-emerald-900/30 text-emerald-400 border border-emerald-700/40 hover:bg-emerald-900/50 disabled:opacity-50',
        sakura: 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50',
    });
    const rejectCls = t4(theme, {
        cyberpunk: 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 disabled:opacity-50',
        paper: 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 disabled:opacity-50',
        dark: 'bg-red-950/40 text-red-400 border border-red-800/40 hover:bg-red-900/40 disabled:opacity-50',
        sakura: 'bg-red-50 text-red-400 border border-red-200 hover:bg-red-100 disabled:opacity-50',
    });
    const markAllCls = t4(theme, {
        cyberpunk: 'text-cyber-secondary/40 hover:text-cyber-secondary',
        paper: 'text-gray-400 hover:text-gray-600',
        dark: 'text-dark-muted hover:text-dark-text',
        sakura: 'text-sakura-muted hover:text-sakura-ink',
    });
    const deleteCls = t4(theme, {
        cyberpunk: 'text-cyber-secondary/30 hover:text-red-400',
        paper: 'text-gray-300 hover:text-red-400',
        dark: 'text-dark-border hover:text-red-400',
        sakura: 'text-sakura-muted/50 hover:text-red-400',
    });

    // ── Data fetching ────────────────────────────────────────────────────────
    const fetchNotifications = useCallback(async () => {
        try {
            const data = await api.get('/notifications/');
            setNotifications(data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        if (isOpen) { setLoading(true); fetchNotifications(); }
    }, [isOpen, fetchNotifications]);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
        };
        const t = setTimeout(() => document.addEventListener('mousedown', handler), 60);
        return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
    }, [isOpen, onClose]);

    // ── Actions ──────────────────────────────────────────────────────────────
    const withActing = async (id, key, fn) => {
        setActing(prev => ({ ...prev, [id]: key }));
        try { await fn(); } finally { setActing(prev => { const n = { ...prev }; delete n[id]; return n; }); }
    };

    const acceptInvite = (id) => withActing(id, 'accept', async () => {
        await api.post(`/notifications/${id}/accept/`);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'accepted' } : n));
        if (onNotificationUpdate) onNotificationUpdate('accepted');
    });

    const rejectInvite = (id) => withActing(id, 'reject', async () => {
        await api.post(`/notifications/${id}/reject/`);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'rejected' } : n));
        if (onNotificationUpdate) onNotificationUpdate('rejected');
    });

    const markRead = async (id) => {
        await api.post(`/notifications/${id}/mark_read/`);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
        if (onNotificationUpdate) onNotificationUpdate();
    };

    const markAllRead = async () => {
        await api.post('/notifications/mark_all_read/');
        setNotifications(prev => prev.map(n =>
            n.status === 'pending' && n.notification_type !== 'community_invite'
                ? { ...n, status: 'read' } : n
        ));
        if (onNotificationUpdate) onNotificationUpdate();
    };

    const deleteNotif = (id) => withActing(id, 'delete', async () => {
        await api.delete(`/notifications/${id}/`);
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (onNotificationUpdate) onNotificationUpdate();
    });

    // ── Render ────────────────────────────────────────────────────────────────
    if (!isOpen) return null;

    const pendingCount = notifications.filter(n => n.status === 'pending').length;
    const hasUnreadInfo = notifications.some(n =>
        n.status === 'pending' && n.notification_type !== 'community_invite'
    );

    return (
        <div
            ref={panelRef}
            className={`absolute right-0 top-full mt-2 w-96 max-h-[520px] flex flex-col rounded-xl overflow-hidden z-[300]
                animate-in fade-in slide-in-from-top-2 duration-200 ${panelBg}`}
            style={{ minWidth: '22rem' }}
        >
            {/* ── Header ── */}
            <div className={`flex items-center justify-between px-4 py-3 flex-shrink-0 ${headerCls}`}>
                <div className="flex items-center gap-2">
                    <Bell size={15} className={titleCls} />
                    <span className={`text-sm font-semibold ${titleCls}`}>Notificaciones</span>
                    {pendingCount > 0 && (
                        <span className={`text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 font-bold ${badgeCls}`}>
                            {pendingCount}
                        </span>
                    )}
                </div>
                {hasUnreadInfo && (
                    <button onClick={markAllRead} className={`text-xs transition-all ${markAllCls}`}>
                        Marcar leídas
                    </button>
                )}
            </div>

            {/* ── Body ── */}
            <div className={`flex-1 overflow-y-auto ${scrollCls}`}>
                {loading ? (
                    <div className={`flex flex-col items-center justify-center py-12 gap-2 ${muted}`}>
                        <Loader2 size={24} className="animate-spin" />
                        <span className="text-xs">Cargando...</span>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 gap-3">
                        <Bell size={32} className={muted} />
                        <p className={`text-sm ${muted}`}>Sin notificaciones</p>
                    </div>
                ) : (
                    notifications.map(n => {
                        const cfg = TYPE_CONFIG[n.notification_type] || TYPE_CONFIG.new_project;
                        const isPending = n.status === 'pending';
                        const isInvite = n.notification_type === 'community_invite';
                        const isAccepted = n.status === 'accepted';
                        const isRejected = n.status === 'rejected';
                        const isActing = acting[n.id];

                        return (
                            <div
                                key={n.id}
                                className={`flex gap-3 px-4 py-3 transition-all cursor-default ${itemCls}
                                    ${!isPending ? 'opacity-55' : ''}`}
                                onClick={() => {
                                    // Auto-mark info notifications as read on click
                                    if (isPending && !isInvite) markRead(n.id);
                                }}
                            >
                                {/* Icon */}
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base ${iconBgCls}`}>
                                    {cfg.emoji}
                                </div>

                                {/* Body */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm leading-snug ${textCls}`}>{n.message}</p>

                                    {/* Meta row */}
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                                        <span className={`text-xs tabular-nums ${muted}`}>{fmtDate(n.created_at)}</span>
                                        {n.community_name && (
                                            <>
                                                <span className={`text-xs ${muted}`}>·</span>
                                                <span className={`text-xs font-medium ${subtle}`}>{n.community_name}</span>
                                            </>
                                        )}
                                        {/* Status badge */}
                                        {isAccepted && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700">
                                                ✓ Aceptada
                                            </span>
                                        )}
                                        {isRejected && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-red-50 text-red-500">
                                                ✗ Rechazada
                                            </span>
                                        )}
                                    </div>

                                    {/* Invite action buttons */}
                                    {isInvite && isPending && (
                                        <div className="flex gap-2 mt-2.5">
                                            <button
                                                disabled={!!isActing}
                                                onClick={() => acceptInvite(n.id)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${acceptCls}`}
                                            >
                                                {isActing === 'accept'
                                                    ? <Loader2 size={11} className="animate-spin" />
                                                    : <Check size={11} strokeWidth={3} />
                                                }
                                                Aceptar
                                            </button>
                                            <button
                                                disabled={!!isActing}
                                                onClick={() => rejectInvite(n.id)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${rejectCls}`}
                                            >
                                                {isActing === 'reject'
                                                    ? <Loader2 size={11} className="animate-spin" />
                                                    : <X size={11} strokeWidth={3} />
                                                }
                                                Rechazar
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Right col: dot or delete */}
                                <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                                    {isPending && !isInvite && (
                                        <div className={`w-2 h-2 rounded-full ${dotCls}`} />
                                    )}
                                    {!isPending && (
                                        <button
                                            disabled={isActing === 'delete'}
                                            onClick={() => deleteNotif(n.id)}
                                            className={`p-0.5 rounded-md transition-all ${deleteCls}`}
                                            title="Eliminar"
                                        >
                                            {isActing === 'delete'
                                                ? <Loader2 size={12} className="animate-spin" />
                                                : <X size={12} />
                                            }
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
