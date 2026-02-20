import React, { useState, useEffect } from 'react';
import { useTheme, THEMES } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

const AVATARS = [
    { url: 'https://api.dicebear.com/9.x/croodles-neutral/svg?seed=Felix', label: 'Fox' },
    { url: 'https://api.dicebear.com/9.x/croodles-neutral/svg?seed=Mochi', label: 'Cat' },
    { url: 'https://api.dicebear.com/9.x/croodles-neutral/svg?seed=Luna', label: 'Bunny' },
    { url: 'https://api.dicebear.com/9.x/croodles-neutral/svg?seed=Kodama', label: 'Bear' },
    { url: 'https://api.dicebear.com/9.x/croodles-neutral/svg?seed=Yuki', label: 'Panda' },
    { url: 'https://api.dicebear.com/9.x/croodles-neutral/svg?seed=Hoshi', label: 'Wolf' },
    { url: 'https://api.dicebear.com/9.x/croodles-neutral/svg?seed=Tanuki', label: 'Raccoon' },
    { url: 'https://api.dicebear.com/9.x/croodles-neutral/svg?seed=Akiko', label: 'Deer' },
];

const getStyles = (theme) => ({
    cyberpunk: {
        page: 'font-cyber',
        title: 'text-cyber-primary border-cyber-primary',
        section: 'bg-cyber-black/40 border-2 border-cyber-secondary shadow-[0_0_15px_rgba(0,204,255,0.15)]',
        label: 'text-cyber-secondary/60',
        input: 'bg-cyber-black border border-cyber-primary/40 text-cyber-secondary focus:border-cyber-primary focus:shadow-[0_0_8px_#ff005533] outline-none',
        btnPrimary: 'bg-cyber-primary text-black font-bold hover:shadow-[0_0_15px_#ff0055] transition-all',
        btnAccent: 'bg-cyber-accent text-black font-bold hover:shadow-[0_0_15px_#f0f] transition-all',
        msg: { success: 'bg-green-500/15 text-green-400 border border-green-500/40', error: 'bg-red-500/15 text-red-400 border border-red-500/40' },
    },
    paper: {
        page: 'font-paper',
        title: 'text-paper-ink border-paper-ink',
        section: 'bg-white border-4 border-paper-ink sketchy-box shadow-md',
        label: 'text-paper-ink/60',
        input: 'bg-white border-2 border-paper-ink/40 text-paper-ink focus:border-paper-ink sketchy-input outline-none',
        btnPrimary: 'bg-paper-ink text-white font-bold hover:bg-paper-highlight hover:text-paper-ink transition-all sketchy-box',
        btnAccent: 'bg-paper-red text-white font-bold hover:bg-white hover:text-paper-red transition-all sketchy-box',
        msg: { success: 'bg-green-100 text-green-700 border border-green-300', error: 'bg-red-100 text-red-700 border border-red-300' },
    },
    dark: {
        page: 'font-dark',
        title: 'text-dark-text border-dark-border',
        section: 'bg-dark-surface border border-dark-border rounded-xl shadow-lg',
        label: 'text-dark-muted',
        input: 'bg-dark-elevated border border-dark-border text-dark-text rounded-lg focus:border-dark-primary/50 focus:ring-1 focus:ring-dark-primary/20 outline-none',
        btnPrimary: 'bg-dark-primary text-white font-semibold rounded-lg hover:bg-dark-primary/85 transition-all',
        btnAccent: 'bg-dark-accent text-dark-bg font-semibold rounded-lg hover:bg-dark-accent/85 transition-all',
        msg: { success: 'bg-dark-success/10 text-dark-success border border-dark-success/30 rounded-lg', error: 'bg-red-950/50 text-red-400 border border-red-800/40 rounded-lg' },
    },
    sakura: {
        page: 'font-sakura',
        title: 'text-sakura-ink border-sakura-blossom',
        section: 'bg-white sakura-card',
        label: 'text-sakura-muted',
        input: 'bg-sakura-surface border border-sakura-blossom/50 text-sakura-ink rounded-xl focus:border-sakura-deep/60 focus:ring-1 focus:ring-sakura-blossom/30 outline-none',
        btnPrimary: 'bg-sakura-deep text-white font-semibold rounded-xl hover:bg-sakura-deep/85 transition-all shadow-sm',
        btnAccent: 'bg-sakura-gold text-white font-semibold rounded-xl hover:bg-sakura-gold/85 transition-all shadow-sm',
        msg: { success: 'bg-green-50 text-green-700 border border-green-200 rounded-xl', error: 'bg-red-50 text-red-500 border border-red-200 rounded-xl' },
    },
})[theme] || {};

// ── Theme Preview Card ─────────────────────────────────────────────────────────
const ThemeCard = ({ themeKey, currentTheme, onSelect }) => {
    const t = THEMES[themeKey];
    const isActive = currentTheme === themeKey;
    const [hovered, setHovered] = useState(false);

    const cardStyle = {
        background: t.preview.bg,
        border: `2px solid ${isActive ? t.preview.accent : 'transparent'}`,
        boxShadow: isActive ? `0 0 0 1px ${t.preview.accent}, 0 4px 20px ${t.preview.accent}33` : '0 2px 8px rgba(0,0,0,0.12)',
        transform: hovered && !isActive ? 'translateY(-2px)' : isActive ? 'scale(1.02)' : 'none',
        transition: 'all 0.2s ease',
    };

    return (
        <button
            onClick={() => onSelect(themeKey)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="w-full text-left rounded-xl overflow-hidden"
            style={cardStyle}
        >
            {/* Mini preview */}
            <div className="h-16 relative overflow-hidden" style={{ background: t.preview.bg }}>
                {/* Fake navbar */}
                <div className="h-5 flex items-center px-2 gap-1.5" style={{ background: `${t.preview.accent}22`, borderBottom: `1px solid ${t.preview.accent}44` }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: t.preview.accent }} />
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: `${t.preview.text}15` }} />
                    <div className="w-4 h-1.5 rounded" style={{ background: `${t.preview.accent}60` }} />
                </div>
                {/* Fake content */}
                <div className="px-3 pt-2 space-y-1">
                    <div className="w-16 h-1.5 rounded-full" style={{ background: t.preview.accent }} />
                    <div className="w-24 h-1 rounded-full" style={{ background: `${t.preview.text}25` }} />
                    <div className="w-20 h-1 rounded-full" style={{ background: `${t.preview.text}18` }} />
                </div>
                {/* Active checkmark */}
                {isActive && (
                    <div className="absolute top-1.5 right-2 w-4 h-4 rounded-full flex items-center justify-center text-xs"
                        style={{ background: t.preview.accent, color: '#fff' }}>✓</div>
                )}
            </div>
            {/* Label */}
            <div className="px-3 py-2.5" style={{ background: t.preview.bg }}>
                <div className="text-xs font-bold tracking-wider" style={{ color: t.preview.accent }}>{t.label}</div>
                <div className="text-xs mt-0.5" style={{ color: `${t.preview.text}70` }}>{t.description}</div>
            </div>
        </button>
    );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const SettingsPage = () => {
    const { theme, setTheme } = useTheme();
    const { user, loading, refreshUser } = useUser();
    const s = getStyles(theme);

    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [avatarIndex, setAvatarIndex] = useState(0);
    const [hoveredAvatar, setHoveredAvatar] = useState(null);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [updating, setUpdating] = useState(false);

    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setDisplayName(user.profile?.display_name || '');
            setAvatarIndex(user.profile?.avatar_index || 0);
        }
    }, [user]);

    const showMsg = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3500);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const [uRes, pRes] = await Promise.all([
                fetch(`${API_URL}/me/`, {
                    method: 'PATCH',
                    headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username }),
                }),
                fetch(`${API_URL}/profile/`, {
                    method: 'PATCH',
                    headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ display_name: displayName, avatar_index: avatarIndex }),
                }),
            ]);
            if (uRes.ok && pRes.ok) {
                showMsg('¡Perfil actualizado!', 'success');
                await refreshUser();
            } else {
                const ud = uRes.ok ? {} : await uRes.json();
                showMsg(ud.username?.[0] || 'Error al actualizar.', 'error');
            }
        } catch { showMsg('Error de conexión.', 'error'); }
        finally { setUpdating(false); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/change-password/`, {
                method: 'PATCH',
                headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
            });
            if (res.ok) {
                showMsg('¡Contraseña cambiada!', 'success');
                setOldPassword(''); setNewPassword('');
            } else {
                const err = await res.json();
                showMsg(err.old_password?.[0] || 'Error al cambiar.', 'error');
            }
        } catch { showMsg('Error de conexión.', 'error'); }
    };

    if (loading && !user) return <div className="p-8 text-center">Cargando...</div>;

    const inputClass = `w-full px-3 py-2.5 text-sm transition-all ${s.input}`;
    const labelClass = `block text-xs font-semibold uppercase tracking-wider mb-1.5 ${s.label}`;

    return (
        <div className={`max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ${s.page}`}>

            <h2 className={`text-3xl font-bold border-b-2 pb-2 ${s.title}`}>
                {theme === 'cyberpunk' ? '// SETTINGS' : theme === 'sakura' ? '設定 · Settings' : 'Settings'}
            </h2>

            {message.text && (
                <div className={`p-3 text-sm font-medium ${s.msg[message.type]}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* ── Profile ── */}
                <section className={`p-6 space-y-5 ${s.section}`}>
                    <h3 className="text-base font-bold uppercase tracking-widest">Perfil</h3>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className={labelClass}>Username</label>
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                                className={inputClass} placeholder="tu_username..." />
                        </div>
                        <div>
                            <label className={labelClass}>Nombre de display</label>
                            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                                className={inputClass} placeholder="Tu nombre público..." />
                        </div>

                        {/* Avatar selector */}
                        <div>
                            <label className={labelClass}>Avatar Animal</label>
                            <div className="grid grid-cols-4 gap-2">
                                {AVATARS.map((av, i) => (
                                    <button key={i} type="button"
                                        onClick={() => setAvatarIndex(i)}
                                        onMouseEnter={() => setHoveredAvatar(i)}
                                        onMouseLeave={() => setHoveredAvatar(null)}
                                        className={`relative flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all border-2 group
                                            ${avatarIndex === i
                                                ? (theme === 'cyberpunk' ? 'border-cyber-accent bg-cyber-accent/10 scale-110' :
                                                    theme === 'paper' ? 'border-paper-red bg-paper-highlight scale-110' :
                                                        theme === 'dark' ? 'border-dark-primary bg-dark-primary/10 scale-110' :
                                                            'border-sakura-deep bg-sakura-blossom/20 scale-110')
                                                : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                                            }`}>
                                        <img
                                            src={av.url}
                                            alt={av.label}
                                            className="w-12 h-12 object-contain transition-all"
                                            style={{
                                                animation: hoveredAvatar === i
                                                    ? 'wiggle 0.4s ease-in-out 3'
                                                    : avatarIndex === i
                                                        ? 'float 2.5s ease-in-out infinite'
                                                        : 'none'
                                            }}
                                        />
                                        <span className={`text-xs font-medium ${s.label}`}>{av.label}</span>
                                        {avatarIndex === i && (
                                            <span className="absolute -top-1 -right-1 text-xs">
                                                {theme === 'sakura' ? '🌸' : '✓'}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button type="submit" disabled={updating}
                            className={`w-full py-2.5 text-sm transition-all disabled:opacity-50 ${s.btnPrimary}`}>
                            {updating ? 'Guardando...' : 'Actualizar perfil'}
                        </button>
                    </form>
                </section>

                {/* ── Password ── */}
                <section className={`p-6 space-y-5 ${s.section}`}>
                    <h3 className="text-base font-bold uppercase tracking-widest">Cambiar Contraseña</h3>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className={labelClass}>Contraseña actual</label>
                            <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)}
                                className={inputClass} placeholder="••••••••" />
                        </div>
                        <div>
                            <label className={labelClass}>Nueva contraseña</label>
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                className={inputClass} placeholder="••••••••" />
                        </div>
                        <button type="submit"
                            className={`w-full py-2.5 text-sm transition-all ${s.btnAccent}`}>
                            Guardar contraseña
                        </button>
                    </form>
                </section>
            </div>

            {/* ── Appearance ── */}
            <section className={`p-6 ${s.section}`}>
                <h3 className="text-base font-bold uppercase tracking-widest mb-5">Apariencia</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.keys(THEMES).map(key => (
                        <ThemeCard key={key} themeKey={key} currentTheme={theme} onSelect={setTheme} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default SettingsPage;
