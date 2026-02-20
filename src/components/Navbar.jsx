import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Globe, Timer, StickyNote, Settings, LogOut, Bell, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import NotificationPanel from './NotificationPanel';

// ── Avatar with initial ───────────────────────────────────────────────────────
// Maps a string to a consistent hue (0-360)
const strToHue = (s) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
    return h % 360;
};

const Avatar = ({ name = '?', size = 36, theme }) => {
    const hue = strToHue(name);
    const initial = (name[0] || '?').toUpperCase();

    // Per-theme palette decisions
    const ringCls = {
        cyberpunk: 'ring-2 ring-cyber-accent shadow-[0_0_8px_#ccff0055]',
        paper: 'ring-2 ring-paper-ink',
        dark: 'ring-2 ring-dark-primary/60',
        sakura: 'ring-2 ring-sakura-blossom shadow-[0_0_8px_rgba(232,87,122,0.3)]',
    }[theme] || '';

    // Pastel-ish bg color from hue
    const bg = `hsl(${hue}, 55%, ${theme === 'cyberpunk' ? '20%' : theme === 'dark' ? '18%' : '85%'})`;
    const fg = `hsl(${hue}, 65%, ${theme === 'cyberpunk' ? '70%' : theme === 'dark' ? '75%' : '30%'})`;

    return (
        <div
            className={`flex items-center justify-center rounded-full font-black select-none flex-shrink-0 ${ringCls}`}
            style={{
                width: size,
                height: size,
                background: bg,
                color: fg,
                fontSize: Math.round(size * 0.42),
                fontFamily: 'Inter, system-ui, sans-serif',
                letterSpacing: '-0.02em',
            }}
        >
            {initial}
        </div>
    );
};

export { Avatar };

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { key: 'personal', label: 'Personal', Icon: Layout },
    { key: 'community', label: 'Community', Icon: Globe },
    { key: 'timer', label: 'Timer', Icon: Timer },
    { key: 'notes', label: 'Notes', Icon: StickyNote },
];

// ── Per-theme styles ──────────────────────────────────────────────────────────
const getThemeStyles = (theme) => {
    switch (theme) {
        case 'cyberpunk':
            return {
                nav: 'bg-cyber-dark/90 border-cyber-primary text-cyber-secondary backdrop-blur-md border-b-2',
                mobileMenu: 'bg-cyber-dark border-b-2 border-cyber-primary shadow-[0_4px_15px_rgba(255,0,85,0.2)]',
                logo: 'text-cyber-secondary',
                logoAccent: 'text-cyber-accent',
                navBtn: (a) => `border border-transparent font-bold tracking-wider text-sm
                    ${a ? 'bg-cyber-primary/15 border-cyber-primary/50 text-cyber-primary shadow-[0_0_8px_#ff005533]'
                        : 'text-cyber-secondary/60 hover:text-cyber-secondary hover:border-cyber-primary/25'}`,
                userBorder: 'border-cyber-primary/25',
                actionBtn: (a) => `border border-transparent ${a
                    ? 'text-cyber-primary border-cyber-primary/40 bg-cyber-primary/10'
                    : 'text-cyber-secondary/50 hover:text-cyber-secondary hover:border-cyber-primary/25'}`,
                logoutBtn: 'border-red-500/40 text-red-400 hover:bg-red-500/15 hover:border-red-400',
                bellBadge: 'bg-cyber-primary text-black',
                nameCls: 'text-cyber-secondary uppercase tracking-wider',
            };
        case 'paper':
            return {
                nav: 'bg-paper-bg border-paper-ink text-paper-ink sketchy-border border-b-2',
                mobileMenu: 'bg-paper-bg border-b-2 border-paper-ink sketchy-box shadow-lg',
                logo: 'text-paper-ink',
                logoAccent: 'text-paper-red scribble-underline',
                navBtn: (a) => `sketchy-box border-2 font-bold
                    ${a ? 'bg-paper-highlight border-paper-ink text-paper-ink'
                        : 'border-transparent text-paper-ink/55 hover:text-paper-ink hover:border-paper-ink/35'}`,
                userBorder: 'border-paper-ink/25',
                actionBtn: (a) => `sketchy-box border-2 ${a
                    ? 'border-paper-ink bg-paper-highlight text-paper-ink'
                    : 'border-transparent text-paper-ink/50 hover:border-paper-ink/30 hover:text-paper-ink'}`,
                logoutBtn: 'border-2 border-paper-red/40 text-paper-red hover:bg-paper-red/10 hover:border-paper-red sketchy-box',
                bellBadge: 'bg-paper-red text-white',
                nameCls: 'text-paper-ink uppercase tracking-wider',
            };
        case 'dark':
            return {
                nav: 'bg-dark-surface border-dark-border text-dark-text border-b',
                mobileMenu: 'bg-dark-surface border-b border-dark-border shadow-2xl',
                logo: 'text-dark-text',
                logoAccent: 'text-dark-primary',
                navBtn: (a) => `text-sm font-medium rounded-lg
                    ${a ? 'bg-dark-primary/15 text-dark-primary'
                        : 'text-dark-muted hover:text-dark-text hover:bg-dark-elevated'}`,
                userBorder: 'border-dark-border',
                actionBtn: (a) => `rounded-lg ${a
                    ? 'text-dark-primary bg-dark-primary/10'
                    : 'text-dark-muted hover:text-dark-text hover:bg-dark-elevated'}`,
                logoutBtn: 'rounded-lg border border-red-900/40 text-red-400 hover:bg-red-950/50 hover:border-red-800',
                bellBadge: 'bg-dark-primary text-white',
                nameCls: 'text-dark-subtle',
            };
        case 'sakura':
            return {
                nav: 'bg-sakura-surface border-sakura-blossom/40 text-sakura-ink border-b-2',
                mobileMenu: 'bg-sakura-surface border-b border-sakura-blossom shadow-xl',
                logo: 'text-sakura-ink',
                logoAccent: 'text-sakura-deep',
                navBtn: (a) => `text-sm font-medium rounded-xl
                    ${a ? 'bg-sakura-blossom/30 text-sakura-deep border border-sakura-blossom'
                        : 'text-sakura-muted hover:text-sakura-ink hover:bg-sakura-petal/50 border border-transparent'}`,
                userBorder: 'border-sakura-blossom/40',
                actionBtn: (a) => `rounded-xl border border-transparent ${a
                    ? 'text-sakura-deep bg-sakura-blossom/25 border-sakura-blossom/50'
                    : 'text-sakura-muted hover:text-sakura-ink hover:bg-sakura-petal/40'}`,
                logoutBtn: 'rounded-xl border border-red-200 text-red-400 hover:bg-red-50 hover:border-red-300',
                bellBadge: 'bg-sakura-deep text-white',
                nameCls: 'text-sakura-subtle',
            };
        default:
            return {};
    }
};

// ── Navbar ────────────────────────────────────────────────────────────────────
const Navbar = ({ currentView, setView, onCommunityJoined }) => {
    const { theme } = useTheme();
    const { user, logout } = useUser();
    const [showNotifications, setShowNotifications] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const s = getThemeStyles(theme);
    const displayName = user?.profile?.display_name || user?.username || 'User';

    // ── Poll unread count every 30s ──
    const fetchCount = useCallback(async () => {
        try {
            const d = await api.get('/notifications/unread_count/');
            setUnreadCount(d.count || 0);
        } catch {/* silent */ }
    }, []);

    useEffect(() => {
        fetchCount();
        const id = setInterval(fetchCount, 30_000);
        return () => clearInterval(id);
    }, [fetchCount]);

    // Notification update: if a community invite was accepted → refresh CommunityView
    const handleNotifUpdate = useCallback((action) => {
        fetchCount();
        if (action === 'accepted' && onCommunityJoined) {
            onCommunityJoined();
        }
    }, [fetchCount, onCommunityJoined]);

    return (
        <nav className={`px-4 py-2.5 flex justify-between items-center z-50 gap-3 transition-colors duration-300 relative ${s.nav}`}>

            <div className="flex items-center gap-2 md:gap-3">
                {/* ── Mobile Hamburger ── */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className={`md:hidden p-1.5 transition-all ${s.actionBtn(isMobileMenuOpen)}`}
                >
                    {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>

                {/* ── Logo ── */}
                <h1 className={`text-lg font-black tracking-tighter flex-shrink-0 ${s.logo}`}>
                    PROJECT{' '}
                    <span className={s.logoAccent}>VOLCAN</span>
                </h1>
            </div>

            {/* ── Desktop Navigation ── */}
            <div className="hidden md:flex gap-1 absolute left-1/2 -translate-x-1/2">
                {NAV_ITEMS.map(({ key, label, Icon }) => {
                    const active = currentView === key;
                    return (
                        <button
                            key={key}
                            onClick={() => setView(key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 transition-all ${s.navBtn(active)}`}
                        >
                            <Icon size={14} strokeWidth={active ? 2.5 : 2} />
                            <span className="text-xs">{label}</span>
                        </button>
                    );
                })}
            </div>

            {/* ── Right: User + actions ── */}
            <div className="flex items-center gap-1.5 md:gap-2.5 flex-shrink-0">

                {/* User avatar (initial circle) + name */}
                <div className={`flex items-center gap-2 pr-1.5 md:pr-2.5 border-r ${s.userBorder}`}>
                    <Avatar name={displayName} size={30} theme={theme} />
                    <span className={`font-semibold text-xs hidden md:block truncate max-w-[5rem] ${s.nameCls}`}>
                        {displayName}
                    </span>
                </div>

                {/* ── Bell ── */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(v => !v)}
                        title="Notificaciones"
                        className={`p-1.5 transition-all relative ${s.actionBtn(showNotifications)}`}
                    >
                        <Bell size={15} strokeWidth={showNotifications ? 2.5 : 1.75} />
                        {unreadCount > 0 && (
                            <span className={`absolute -top-1 -right-1 min-w-[17px] h-[17px] flex items-center
                                justify-center text-[9px] font-bold rounded-full px-1
                                animate-in zoom-in duration-200 ${s.bellBadge}`}>
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>

                    <NotificationPanel
                        isOpen={showNotifications}
                        onClose={() => setShowNotifications(false)}
                        theme={theme}
                        onNotificationUpdate={handleNotifUpdate}
                    />
                </div>

                {/* Settings */}
                <button
                    onClick={() => setView('settings')}
                    title="Settings"
                    className={`p-1.5 transition-all hidden sm:block ${s.actionBtn(currentView === 'settings')}`}
                >
                    <Settings size={15} strokeWidth={currentView === 'settings' ? 2.5 : 1.75} />
                </button>

                {/* Logout */}
                <button
                    onClick={logout}
                    title="Cerrar sesión"
                    className={`p-1.5 border transition-all ${s.logoutBtn}`}
                >
                    <LogOut size={15} strokeWidth={1.75} />
                </button>
            </div>

            {/* ── Mobile Menu Dropdown ── */}
            {isMobileMenuOpen && (
                <div className={`absolute top-full left-0 w-full flex flex-col p-4 gap-2 md:hidden z-[60] ${s.mobileMenu} animate-in slide-in-from-top-2 duration-200`}>
                    {NAV_ITEMS.map(({ key, label, Icon }) => {
                        const active = currentView === key;
                        return (
                            <button
                                key={key}
                                onClick={() => { setView(key); setIsMobileMenuOpen(false); }}
                                className={`flex items-center gap-3 px-4 py-3 transition-all w-full text-left ${s.navBtn(active)}`}
                            >
                                <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                                <span className="text-sm font-bold uppercase tracking-wide">{label}</span>
                            </button>
                        );
                    })}

                    {/* Settings mobile option */}
                    <div className={`mt-2 pt-2 border-t ${s.userBorder}`}>
                        <button
                            onClick={() => { setView('settings'); setIsMobileMenuOpen(false); }}
                            className={`flex items-center gap-3 px-4 py-3 transition-all w-full text-left mt-1 ${s.navBtn(currentView === 'settings')}`}
                        >
                            <Settings size={16} strokeWidth={currentView === 'settings' ? 2.5 : 2} />
                            <span className="text-sm font-bold uppercase tracking-wide">Ajustes</span>
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
