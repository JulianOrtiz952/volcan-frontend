import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

const AVATARS = [
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=Bear',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=Cat',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=Fox',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=Dog',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=Rabbit',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=Panda'
];

const SettingsPage = () => {
    const { theme, setTheme } = useTheme();
    const { user, loading, refreshUser } = useUser();
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [avatarIndex, setAvatarIndex] = useState(0);
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

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            // 1. Update User (username)
            const userRes = await fetch(`${API_URL}/me/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username })
            });

            // 2. Update Profile (display_name, avatar)
            const profileRes = await fetch(`${API_URL}/profile/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    display_name: displayName,
                    avatar_index: avatarIndex
                })
            });

            if (userRes.ok && profileRes.ok) {
                setMessage({ text: 'Account updated successfully!', type: 'success' });
                await refreshUser();
            } else {
                const userData = userRes.ok ? {} : await userRes.json();
                setMessage({
                    text: userData.username?.[0] || 'Error updating account details.',
                    type: 'error'
                });
            }
        } catch (err) {
            setMessage({ text: 'Connection error.', type: 'error' });
        } finally {
            setUpdating(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/change-password/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password: newPassword
                })
            });
            if (res.ok) {
                setMessage({ text: 'Password changed successfully!', type: 'success' });
                setOldPassword('');
                setNewPassword('');
            } else {
                const errorData = await res.json();
                setMessage({ text: errorData.old_password?.[0] || 'Error changing password.', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Connection error.', type: 'error' });
        }
    };

    if (loading && !user) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className={`text-3xl font-bold border-b-2 pb-2 
                ${theme === 'cyberpunk' ? 'border-cyber-primary text-cyber-primary' : 'border-paper-ink text-paper-ink scribble-underline'}
            `}>
                USER SETTINGS
            </h2>

            {message.text && (
                <div className={`p-3 text-sm font-bold ${message.type === 'success' ? 'bg-green-500/20 text-green-500 border border-green-500' : 'bg-red-500/20 text-red-500 border border-red-500'}`}>
                    {message.text.toUpperCase()}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Section */}
                <section className={`p-6 border-2 
                    ${theme === 'cyberpunk' ? 'bg-cyber-black/40 border-cyber-secondary shadow-[0_0_15px_rgba(0,204,255,0.2)]' : 'bg-white border-paper-ink sketchy-box'}
                `}>
                    <h3 className="text-xl font-bold mb-4">PROFILE INFO</h3>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold mb-1 opacity-70">USERNAME (Login ID)</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={`w-full p-2 bg-transparent border 
                                    ${theme === 'cyberpunk' ? 'border-cyber-primary focus:shadow-[0_0_10px_#ff0055] outline-none' : 'border-paper-ink'}
                                `}
                                placeholder="Login username..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold mb-1 opacity-70">DISPLAY NAME</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className={`w-full p-2 bg-transparent border 
                                    ${theme === 'cyberpunk' ? 'border-cyber-primary focus:shadow-[0_0_10px_#ff0055] outline-none' : 'border-paper-ink'}
                                `}
                                placeholder="Public display name..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold mb-2 opacity-70">AVATAR</label>
                            <div className="grid grid-cols-3 gap-2">
                                {AVATARS.map((url, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setAvatarIndex(index)}
                                        className={`p-1 border-2 transition-all hover:scale-105 active:scale-95
                                            ${avatarIndex === index ? (theme === 'cyberpunk' ? 'border-cyber-accent scale-110 shadow-[0_0_10px_#f0f]' : 'border-paper-red bg-paper-highlight scale-110') : 'border-transparent opacity-60'}
                                        `}
                                    >
                                        <img src={url} alt={`Avatar ${index}`} className="w-full h-auto rounded-none" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`w-full py-2 font-bold transition-all
                                ${theme === 'cyberpunk' ? 'bg-cyber-primary text-cyber-black hover:shadow-[0_0_15px_#ff0055]' : 'bg-paper-ink text-white hover:bg-paper-highlight hover:text-paper-ink'}
                            `}
                        >
                            UPDATE PROFILE
                        </button>
                    </form>
                </section>

                {/* Password Section */}
                <section className={`p-6 border-2 
                    ${theme === 'cyberpunk' ? 'bg-cyber-black/40 border-cyber-accent shadow-[0_0_15px_rgba(255,0,255,0.2)]' : 'bg-white border-paper-ink sketchy-box'}
                `}>
                    <h3 className="text-xl font-bold mb-4">CHANGE PASSWORD</h3>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold mb-1 opacity-70">OLD PASSWORD</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className={`w-full p-2 bg-transparent border 
                                    ${theme === 'cyberpunk' ? 'border-cyber-primary focus:shadow-[0_0_10px_#ff0055] outline-none' : 'border-paper-ink'}
                                `}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1 opacity-70">NEW PASSWORD</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={`w-full p-2 bg-transparent border 
                                    ${theme === 'cyberpunk' ? 'border-cyber-primary focus:shadow-[0_0_10px_#ff0055] outline-none' : 'border-paper-ink'}
                                `}
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full py-2 font-bold transition-all
                                ${theme === 'cyberpunk' ? 'bg-cyber-accent text-cyber-black hover:shadow-[0_0_15px_#f0f]' : 'bg-paper-red text-white hover:bg-white hover:text-paper-red'}
                            `}
                        >
                            SAVE PASSWORD
                        </button>
                    </form>
                </section>
            </div>

            {/* Appearance Section */}
            <section className={`p-6 border-2 
                ${theme === 'cyberpunk' ? 'bg-cyber-black/40 border-cyber-primary shadow-[0_0_15px_rgba(255,0,85,0.2)]' : 'bg-white border-paper-ink sketchy-box'}
            `}>
                <h3 className="text-xl font-bold mb-4">APPEARANCE</h3>
                <div className="flex gap-4">
                    <button
                        onClick={() => setTheme('cyberpunk')}
                        className={`flex-1 py-4 border-2 font-black tracking-widest transition-all
                            ${theme === 'cyberpunk' ? 'bg-cyber-primary text-cyber-black border-cyber-primary scale-105 shadow-[0_0_20px_#ff0055]' : 'border-cyber-primary/30 opacity-50 hover:opacity-100'}
                        `}
                    >
                        CYBERPUNK
                    </button>
                    <button
                        onClick={() => setTheme('paper')}
                        className={`flex-1 py-4 border-2 font-black tracking-widest transition-all font-paper
                            ${theme === 'paper' ? 'bg-paper-highlight text-paper-ink border-paper-ink scale-105 sketchy-box' : 'border-paper-ink/30 opacity-50 hover:opacity-100'}
                        `}
                    >
                        PAPER NOTES
                    </button>
                </div>
            </section>
        </div>
    );
};

export default SettingsPage;
