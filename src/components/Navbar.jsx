import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

const AVATARS = [
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Lion',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Tiger',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Panda',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Bear',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cat',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Fox'
];

const Navbar = ({ currentView, setView }) => {
    const { theme } = useTheme();
    const { user, logout } = useUser();

    const userAvatar = AVATARS[user?.profile?.avatar_index || 0];
    const displayName = user?.profile?.display_name || user?.username || 'User';

    return (
        <nav className={`p-4 border-b-2 flex justify-between items-center z-50
      ${theme === 'cyberpunk' ? 'bg-cyber-dark/90 border-cyber-primary text-cyber-secondary backdrop-blur-md' : ''}
      ${theme === 'paper' ? 'bg-paper-bg border-paper-ink text-paper-ink sketchy-border' : ''}
    `}>
            <h1 className="text-2xl font-bold tracking-tighter">
                PROJECT <span className={theme === 'cyberpunk' ? 'text-cyber-accent' : 'text-paper-red scribble-underline'}>VOLCAN</span>
            </h1>

            <div className="flex gap-4">
                {/* View Switcher */}
                <button
                    onClick={() => setView('personal')}
                    className={`px-4 py-2 font-bold transition-all
            ${currentView === 'personal' ? 'scale-110' : 'opacity-70 hover:opacity-100'}
            ${theme === 'cyberpunk' && currentView === 'personal' ? 'bg-cyber-primary text-cyber-black shadow-[0_0_10px_#ff0055]' : ''}
            ${theme === 'paper' ? 'sketchy-box border-2 border-paper-ink' : ''}
            ${theme === 'paper' && currentView === 'personal' ? 'bg-paper-highlight' : 'bg-transparent'}
          `}
                >
                    PERSONAL
                </button>
                <button
                    onClick={() => setView('community')}
                    className={`px-4 py-2 font-bold transition-all
            ${currentView === 'community' ? 'scale-110' : 'opacity-70 hover:opacity-100'}
            ${theme === 'cyberpunk' && currentView === 'community' ? 'bg-cyber-secondary text-cyber-black shadow-[0_0_10px_#00ccff]' : ''}
            ${theme === 'paper' ? 'sketchy-box border-2 border-paper-ink' : ''}
            ${theme === 'paper' && currentView === 'community' ? 'bg-white' : 'bg-transparent'}
          `}
                >
                    COMMUNITY
                </button>
                <button
                    onClick={() => setView('timer')}
                    className={`px-4 py-2 font-bold transition-all
            ${currentView === 'timer' ? 'scale-110' : 'opacity-70 hover:opacity-100'}
            ${theme === 'cyberpunk' && currentView === 'timer' ? 'bg-cyber-accent text-cyber-black shadow-[0_0_10px_#f0f]' : ''}
            ${theme === 'paper' ? 'sketchy-box border-2 border-paper-ink' : ''}
            ${theme === 'paper' && currentView === 'timer' ? 'bg-yellow-100' : 'bg-transparent'}
          `}
                >
                    TIMER
                </button>
            </div>

            {/* Navigation and Settings */}
            <div className="flex gap-4 items-center">
                {/* User Info */}
                <div className={`flex items-center gap-2 pr-4 border-r-2 ${theme === 'cyberpunk' ? 'border-cyber-primary/30' : 'border-paper-ink/30'}`}>
                    <img
                        src={userAvatar}
                        alt="Avatar"
                        className={`w-10 h-10 p-1 border-2 
                            ${theme === 'cyberpunk' ? 'border-cyber-accent shadow-[0_0_8px_#f0f]' : 'border-paper-ink sketchy-border'}
                        `}
                    />
                    <span className="font-bold text-sm hidden sm:block uppercase tracking-wider">
                        {displayName}
                    </span>
                </div>

                <button
                    onClick={() => setView('settings')}
                    className={`px-3 py-1 font-bold text-xs transition-all
                        ${currentView === 'settings' ? 'scale-110' : 'opacity-70 hover:opacity-100'}
                        ${theme === 'cyberpunk' ? 'bg-cyber-primary text-cyber-black border-2 border-cyber-primary shadow-[0_0_10px_#ff0055]' : 'bg-paper-ink text-white sketchy-box'}
                        ${theme === 'paper' && currentView === 'settings' ? 'bg-paper-highlight text-paper-ink' : ''}
                    `}
                >
                    SETTINGS
                </button>

                <button
                    onClick={logout}
                    className={`text-xs font-bold px-3 py-1 border transition-all
                        ${theme === 'cyberpunk' ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-black' : 'border-paper-red text-paper-red hover:bg-paper-red hover:text-white'}
                    `}
                >
                    LOGOUT
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
