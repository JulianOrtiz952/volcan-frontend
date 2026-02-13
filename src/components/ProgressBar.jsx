import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ProgressBar = ({ progress }) => {
    const { theme } = useTheme();

    const getProgressColor = () => {
        if (progress < 25) return theme === 'cyberpunk' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'bg-red-500';
        if (progress < 50) return theme === 'cyberpunk' ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.8)]' : 'bg-orange-500';
        if (progress < 75) return theme === 'cyberpunk' ? 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]' : 'bg-yellow-400';
        return theme === 'cyberpunk' ? 'bg-cyber-accent shadow-[0_0_15px_#ccff00]' : 'bg-green-500';
    };

    return (
        <div className={`w-full h-6 mt-2 relative overflow-hidden
      ${theme === 'cyberpunk' ? 'bg-cyber-dark border border-cyber-muted' : 'bg-white text-black sketchy-box border-2 border-paper-ink'}
    `}>
            {/* Label inside or above? Let's put inside for cool factor */}
            <div className={`absolute inset-0 flex items-center justify-end px-2 z-10 font-bold text-xs
        ${theme === 'cyberpunk' ? 'text-white shadow-black drop-shadow-md' : 'text-paper-ink'}
      `}>
                {Math.round(progress)}%
            </div>

            <div
                className={`h-full transition-all duration-500 ease-out ${getProgressColor()}
          ${theme === 'paper' ? 'bg-[url("https://www.transparenttextures.com/patterns/scribbles-light.png")] opacity-80' : ''} 
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
