import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ currentView, setView }) => {
    const { theme, toggleTheme } = useTheme();

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
            </div>

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="text-2xl hover:rotate-12 transition-transform"
                title="Toggle Theme"
            >
                {theme === 'cyberpunk' ? '🌙' : '✏️'}
            </button>
        </nav>
    );
};

export default Navbar;
