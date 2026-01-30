import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ProgressBar = ({ progress }) => {
    const { theme } = useTheme();

    return (
        <div className={`w-full h-6 mt-2 relative overflow-hidden
      ${theme === 'cyberpunk' ? 'bg-cyber-dark border border-cyber-muted' : 'bg-white text-black sketchy-box border-2 border-paper-ink'}
    `}>
            {/* Label inside or above? Let's put inside for cool factor */}
            <div className={`absolute inset-0 flex items-center justify-end px-2 z-10 font-bold text-xs
        ${theme === 'cyberpunk' ? 'text-cyber-text shadow-black drop-shadow-md' : 'text-paper-ink'}
      `}>
                Progreso: {Math.round(progress)}%
            </div>

            <div
                className={`h-full transition-all duration-500 ease-out
          ${theme === 'cyberpunk' ? 'bg-cyber-accent shadow-[0_0_15px_#ccff00]' : 'bg-paper-highlight opacity-80'}
          ${theme === 'paper' ? 'bg-[url("https://www.transparenttextures.com/patterns/ scribbles-light.png")]' : ''} 
        `}
                style={{ width: `${progress}%` }}
            />

            {/* Cyberpunk Glitch Decoration */}
            {theme === 'cyberpunk' && (
                <div className="absolute top-0 right-0 bottom-0 w-1 bg-cyber-primary animate-pulse opacity-50" style={{ left: `${progress}%` }} />
            )}
        </div>
    );
};

export default ProgressBar;
