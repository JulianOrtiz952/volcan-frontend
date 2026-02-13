import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('focus'); // 'focus' or 'rest'
    const [customDuration, setCustomDuration] = useState(25);
    const [selectedTag, setSelectedTag] = useState('Trabajo');
    const [selectedProject, setSelectedProject] = useState(null);
    const [sessionStartTime, setSessionStartTime] = useState(null);
    const timerRef = useRef(null);

    // Sync timeLeft with customDuration when not active
    useEffect(() => {
        if (!isActive && mode === 'focus') {
            setTimeLeft(customDuration * 60);
        }
    }, [customDuration, isActive, mode]);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            handleSessionEnd();
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, timeLeft]);

    const handleStart = () => {
        setIsActive(true);
        setSessionStartTime(new Date());
    };

    const handleCancel = async () => {
        if (!isActive) return;

        const end = new Date();
        const duration = (end - sessionStartTime) / (1000 * 60); // minutes

        if (duration > 0.1 && mode === 'focus') {
            try {
                await api.post('/focus-sessions/', {
                    tag: selectedProject ? `Project: ${selectedProject.name}` : selectedTag,
                    project: selectedProject?.id,
                    duration_minutes: parseFloat(duration.toFixed(2)),
                    is_completed: false,
                    end_time: end.toISOString()
                });
            } catch (e) { console.error(e); }
        }

        resetTimer();
    };

    const handleSessionEnd = async () => {
        const end = new Date();
        const duration = (end - sessionStartTime) / (1000 * 60);

        if (mode === 'focus') {
            try {
                await api.post('/focus-sessions/', {
                    tag: selectedProject ? `Project: ${selectedProject.name}` : selectedTag,
                    project: selectedProject?.id,
                    duration_minutes: parseFloat(duration.toFixed(2)),
                    is_completed: true,
                    end_time: end.toISOString()
                });
            } catch (e) { console.error(e); }

            const restMinutes = Math.min(Math.max(Math.floor(duration / 5), 1), 15);
            setMode('rest');
            setTimeLeft(restMinutes * 60);
            setIsActive(false);
        } else {
            resetTimer();
        }
    };

    const resetTimer = () => {
        setIsActive(false);
        setMode('focus');
        setTimeLeft(customDuration * 60);
        setSessionStartTime(null);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    return (
        <TimerContext.Provider value={{
            timeLeft, setTimeLeft,
            isActive, setIsActive,
            mode, setMode,
            customDuration, setCustomDuration,
            selectedTag, setSelectedTag,
            selectedProject, setSelectedProject,
            handleStart, handleCancel, handleSessionEnd, resetTimer
        }}>
            {children}
        </TimerContext.Provider>
    );
};

export const useTimer = () => useContext(TimerContext);
