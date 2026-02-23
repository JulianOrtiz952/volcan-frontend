import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

const t4 = (theme, map) => map[theme] || map.cyberpunk;

const AuthPage = ({ onLogin }) => {
    const { theme } = useTheme();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            let response;
            if (isLogin) {
                response = await api.login(formData.username, formData.password);
            } else {
                response = await api.register(formData.username, formData.password);
            }
            onLogin(response.token);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Theme definitions ──
    const bgCls = t4(theme, {
        cyberpunk: 'bg-cyber-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyber-dark/50 to-cyber-black',
        paper: 'bg-paper-bg pattern-grid-lg',
        dark: 'bg-dark-bg text-dark-text font-dark',
        sakura: 'bg-sakura-bg text-sakura-ink font-sakura'
    });

    const cardCls = t4(theme, {
        cyberpunk: 'bg-cyber-dark/80 border-2 border-cyber-primary shadow-[0_0_20px_rgba(0,255,65,0.2)]',
        paper: 'bg-white border-4 border-paper-ink shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-1',
        dark: 'bg-dark-surface border border-dark-border shadow-[0_8px_48px_rgba(0,0,0,0.6)] rounded-2xl',
        sakura: 'bg-white border border-sakura-blossom/30 shadow-[0_8px_48px_rgba(232,87,122,0.18)] rounded-3xl sakura-card'
    });

    const titleCls = t4(theme, {
        cyberpunk: 'text-cyber-primary glitch-text',
        paper: 'text-paper-ink scribble-underline',
        dark: 'text-dark-text',
        sakura: 'text-sakura-ink'
    });

    const tabContainerCls = t4(theme, {
        cyberpunk: 'border-b-2 border-cyber-primary/20',
        paper: 'border-b-4 border-paper-ink/20',
        dark: 'border-b border-dark-border',
        sakura: 'border-b-2 border-sakura-blossom/30'
    });

    const tabActiveCls = t4(theme, {
        cyberpunk: 'text-cyber-secondary border-b-2 border-cyber-secondary',
        paper: 'text-paper-ink border-b-4 border-paper-red',
        dark: 'text-dark-primary border-b-2 border-dark-primary',
        sakura: 'text-sakura-deep border-b-2 border-sakura-deep'
    });

    const tabInactiveCls = t4(theme, {
        cyberpunk: 'text-cyber-secondary/50 hover:text-cyber-secondary/80',
        paper: 'text-neutral-500 hover:text-paper-ink',
        dark: 'text-dark-muted hover:text-dark-text',
        sakura: 'text-sakura-muted hover:text-sakura-ink'
    });

    const labelCls = t4(theme, {
        cyberpunk: 'text-cyber-secondary/70',
        paper: 'text-neutral-600 font-bold',
        dark: 'text-dark-subtle',
        sakura: 'text-sakura-subtle'
    });

    const inputCls = t4(theme, {
        cyberpunk: 'bg-black/50 border border-cyber-muted focus:border-cyber-primary text-cyber-secondary',
        paper: 'bg-paper-bg border-4 border-paper-line focus:border-paper-ink text-paper-ink',
        dark: 'bg-dark-elevated border border-dark-border text-dark-text placeholder-dark-muted focus:border-dark-primary/50 focus:ring-1 focus:ring-dark-primary/20 rounded-xl',
        sakura: 'bg-white border-2 border-sakura-blossom/50 text-sakura-ink placeholder-sakura-muted focus:border-sakura-deep focus:ring-4 focus:ring-sakura-blossom/30 rounded-2xl'
    });

    const btnSubmitCls = t4(theme, {
        cyberpunk: 'bg-cyber-primary text-black shadow-[0_0_15px_rgba(0,255,65,0.4)] hover:bg-cyber-primary/80',
        paper: 'bg-paper-ink text-white shadow-[4px_4px_0px_0px_rgba(255,50,50,1)] hover:bg-neutral-800',
        dark: 'bg-dark-primary text-white shadow-lg shadow-dark-primary/20 rounded-xl hover:bg-dark-primary/85',
        sakura: 'bg-sakura-deep text-white shadow-lg shadow-sakura-deep/25 rounded-2xl hover:bg-sakura-deep/90'
    });

    const errorCls = t4(theme, {
        cyberpunk: 'text-red-400 bg-red-900/20 border border-red-500',
        paper: 'text-white bg-paper-red font-bold',
        dark: 'text-red-400 bg-red-950/40 border border-red-900/40 rounded-lg',
        sakura: 'text-red-500 bg-red-50 border border-red-200 rounded-xl'
    });

    const footerCls = t4(theme, {
        cyberpunk: 'text-cyber-secondary/50',
        paper: 'text-neutral-500 font-bold',
        dark: 'text-dark-muted tracking-widest uppercase',
        sakura: 'text-sakura-muted tracking-wide'
    });

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${bgCls}`}>
            <div className={`w-full max-w-md p-8 relative overflow-hidden transition-all duration-300 ${cardCls}`}>

                {/* Cyberpunk Decorative Elements */}
                {theme === 'cyberpunk' && (
                    <>
                        <div className="absolute top-0 left-0 w-full h-1 bg-cyber-primary animate-pulse" />
                        <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-cyber-secondary opacity-50" />
                    </>
                )}

                <h1 className={`text-4xl font-bold text-center mb-8 uppercase tracking-widest ${titleCls}`}>
                    VOLCAN
                </h1>

                <div className={`flex mb-8 ${tabContainerCls}`}>
                    <button
                        onClick={() => { setIsLogin(true); setError(null); }}
                        className={`flex-1 py-3 font-semibold uppercase tracking-wider text-sm transition-all
                            ${isLogin ? tabActiveCls : tabInactiveCls}
                        `}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => { setIsLogin(false); setError(null); }}
                        className={`flex-1 py-3 font-semibold uppercase tracking-wider text-sm transition-all
                            ${!isLogin ? tabActiveCls : tabInactiveCls}
                        `}
                    >
                        Registro
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className={`block text-xs uppercase tracking-wider mb-2 ${labelCls}`}>Usuario</label>
                        <input
                            type="text"
                            required
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            className={`w-full p-3 outline-none transition-all ${inputCls}`}
                        />
                    </div>

                    <div>
                        <label className={`block text-xs uppercase tracking-wider mb-2 ${labelCls}`}>Contraseña</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className={`w-full p-3 outline-none transition-all ${inputCls}`}
                        />
                    </div>

                    {error && (
                        <div className={`p-3 text-sm text-center animate-shake ${errorCls}`}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 mt-2 font-semibold text-sm uppercase tracking-widest transition-all
                            ${loading ? 'opacity-50 cursor-wait' : 'active:scale-[0.98]'}
                            ${btnSubmitCls}
                        `}
                    >
                        {loading ? 'Procesando...' : (isLogin ? 'Entrar al Sistema' : 'Crear Cuenta')}
                    </button>
                </form>

                <div className={`mt-8 text-center text-xs ${footerCls}`}>
                    {theme === 'cyberpunk' ? 'CONEXIÓN SEGURA ESTABLECIDA' : 'Sistema de Gestión v1.0'}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
