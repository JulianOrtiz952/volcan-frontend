import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

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
            onLogin(response.token); // Pass token to UserContext via App.jsx
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500
            ${theme === 'cyberpunk' ? 'bg-cyber-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyber-dark/50 to-cyber-black' : 'bg-paper-bg pattern-grid-lg'}
        `}>
            <div className={`w-full max-w-md p-8 relative overflow-hidden transition-all duration-300
                ${theme === 'cyberpunk'
                    ? 'bg-cyber-dark/80 border-2 border-cyber-primary shadow-[0_0_20px_rgba(0,255,65,0.2)]'
                    : 'bg-white border-4 border-paper-ink shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-1'
                }
            `}>
                {/* Cyberpunk Decorative Elements */}
                {theme === 'cyberpunk' && (
                    <>
                        <div className="absolute top-0 left-0 w-full h-1 bg-cyber-primary animate-pulse" />
                        <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-cyber-secondary opacity-50" />
                    </>
                )}

                <h1 className={`text-4xl font-bold text-center mb-8 uppercase tracking-widest
                    ${theme === 'cyberpunk' ? 'text-cyber-primary glitch-text' : 'text-paper-ink scribble-underline'}
                `}>
                    VOLCAN
                </h1>

                <div className="flex mb-8 border-b-2 border-opacity-20 border-gray-500">
                    <button
                        onClick={() => { setIsLogin(true); setError(null); }}
                        className={`flex-1 py-2 font-bold uppercase tracking-wider transition-all
                            ${isLogin
                                ? (theme === 'cyberpunk' ? 'text-cyber-secondary border-b-2 border-cyber-secondary' : 'text-paper-ink border-b-4 border-paper-red')
                                : 'opacity-50 hover:opacity-100'
                            }
                        `}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => { setIsLogin(false); setError(null); }}
                        className={`flex-1 py-2 font-bold uppercase tracking-wider transition-all
                            ${!isLogin
                                ? (theme === 'cyberpunk' ? 'text-cyber-secondary border-b-2 border-cyber-secondary' : 'text-paper-ink border-b-4 border-paper-red')
                                : 'opacity-50 hover:opacity-100'
                            }
                        `}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-2 opacity-70">Username</label>
                        <input
                            type="text"
                            required
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            className={`w-full p-3 outline-none transition-all
                                ${theme === 'cyberpunk'
                                    ? 'bg-black/50 border border-cyber-muted focus:border-cyber-primary text-white'
                                    : 'bg-paper-bg border-2 border-paper-line focus:border-paper-ink text-paper-ink'
                                }
                            `}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase mb-2 opacity-70">Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className={`w-full p-3 outline-none transition-all
                                ${theme === 'cyberpunk'
                                    ? 'bg-black/50 border border-cyber-muted focus:border-cyber-primary text-white'
                                    : 'bg-paper-bg border-2 border-paper-line focus:border-paper-ink text-paper-ink'
                                }
                            `}
                        />
                    </div>

                    {error && (
                        <div className={`p-3 text-sm font-bold text-center animate-shake
                            ${theme === 'cyberpunk' ? 'text-red-400 bg-red-900/20 border border-red-500' : 'text-white bg-paper-red'}
                        `}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 font-bold text-xl uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all
                            ${loading ? 'opacity-50 cursor-wait' : ''}
                            ${theme === 'cyberpunk'
                                ? 'bg-cyber-primary text-black shadow-[0_0_15px_rgba(0,255,65,0.4)]'
                                : 'bg-paper-ink text-white shadow-[4px_4px_0px_0px_rgba(255,50,50,1)]'
                            }
                        `}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Enter System' : 'Join Community')}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs opacity-50">
                    {theme === 'cyberpunk' ? 'SECURE CONNECTION ESTABLISHED' : 'Project Management System v1.0'}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
