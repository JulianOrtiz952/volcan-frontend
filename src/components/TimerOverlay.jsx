import React from 'react';
import { useTimer } from '../context/TimerContext';
import { useTheme } from '../context/ThemeContext';

const TimerOverlay = ({ currentView, setView }) => {
    const { timeLeft, isActive, mode, selectedTag, selectedProject, customDuration } = useTimer();
    const { theme } = useTheme();

    if (!isActive || currentView === 'timer') return null;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div
            onClick={() => setView('timer')}
            className={`
                fixed bottom-6 right-6 z-[100] cursor-pointer group
                p-4 flex items-center gap-4 transition-all duration-300 hover:scale-110 active:scale-95
                ${theme === 'cyberpunk'
                    ? 'bg-cyber-dark/90 border-2 border-cyber-primary text-white shadow-[0_0_20px_rgba(255,0,85,0.4)] backdrop-blur-md'
                    : 'bg-white border-2 border-paper-ink text-paper-ink sketchy-border shadow-xl'}
            `}
        >
            <div className={`relative flex items-center justify-center`}>
                <svg className="w-12 h-12 -rotate-90">
                    <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        className="opacity-20"
                    />
                    <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 20}
                        strokeDashoffset={2 * Math.PI * 20 * (1 - timeLeft / (customDuration * 60))}
                        className="transition-all duration-1000"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black">
                    {mode === 'rest' ? 'REST' : 'FOCUS'}
                </div>
            </div>

            <div>
                <div className="text-xl font-black font-mono tracking-tighter">
                    {formatTime(timeLeft)}
                </div>
                <div className="text-[10px] uppercase font-bold opacity-60 truncate max-w-[80px]">
                    {selectedProject ? selectedProject.name : selectedTag}
                </div>
            </div>

            <div className="hidden group-hover:block ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
            </div>
        </div>
    );
};

export default TimerOverlay;
