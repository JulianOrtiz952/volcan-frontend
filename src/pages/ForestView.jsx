import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import ProgressBar from '../components/ProgressBar';

const PREDEFINED_TAGS = ['Trabajo', 'Estudio', 'Ejercicio', 'Lectura', 'Meditación', 'Ocio'];

const ForestView = () => {
    const { theme } = useTheme();
    const [view, setView] = useState('timer'); // 'timer' or 'reports'

    // Timer State
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('focus'); // 'focus' or 'rest'
    const [selectedTag, setSelectedTag] = useState('Trabajo');
    const [selectedProject, setSelectedProject] = useState(null);
    const [projects, setProjects] = useState([]);
    const [sessionStartTime, setSessionStartTime] = useState(null);

    // Reports State
    const [reports, setReports] = useState({ by_tag: [], by_project: [] });
    const [loadingReports, setLoadingReports] = useState(false);

    const timerRef = useRef(null);

    useEffect(() => {
        fetchProjects();
        if (view === 'reports') fetchReports();
    }, [view]);

    const fetchProjects = async () => {
        try {
            const data = await api.get('/projects/');
            // Filter projects between 0% and 99% progress
            setProjects(data.filter(p => p.progress >= 0 && p.progress < 100));
        } catch (e) { console.error(e); }
    };

    const fetchReports = async () => {
        setLoadingReports(true);
        try {
            const data = await api.get('/focus-sessions/reports/');
            setReports(data);
        } catch (e) { console.error(e); }
        finally { setLoadingReports(false); }
    };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
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

        if (duration > 0.1 && mode === 'focus') { // Only save if more than 6 seconds elapsed
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

            // Set rest time (1/5 of focus time, min 1 min, max 15 min)
            const restMinutes = Math.min(Math.max(Math.floor(duration / 5), 1), 15);
            setMode('rest');
            setTimeLeft(restMinutes * 60);
            setIsActive(true);
            setSessionStartTime(new Date());
        } else {
            // Rest ended
            resetTimer();
        }
    };

    const resetTimer = () => {
        setIsActive(false);
        setMode('focus');
        setTimeLeft(25 * 60);
        setSessionStartTime(null);
        clearInterval(timerRef.current);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="p-8 max-w-6xl mx-auto h-full flex flex-col">
            {/* Header / Tabs */}
            <div className="flex gap-6 mb-12 border-b border-white/10 pb-4">
                <button
                    onClick={() => setView('timer')}
                    className={`text-2xl font-bold transition-all ${view === 'timer' ? 'opacity-100 scale-105' : 'opacity-40 hover:opacity-70'}`}
                >
                    TIMER
                </button>
                <button
                    onClick={() => setView('reports')}
                    className={`text-2xl font-bold transition-all ${view === 'reports' ? 'opacity-100 scale-105' : 'opacity-40 hover:opacity-70'}`}
                >
                    REPORTS
                </button>
            </div>

            {view === 'timer' ? (
                <div className="flex-1 flex flex-col lg:flex-row gap-12 items-center justify-center">
                    {/* Left: Settings & Tags */}
                    <div className="w-full lg:w-80 space-y-8">
                        <div>
                            <h3 className={`text-xs font-bold uppercase mb-4 ${theme === 'cyberpunk' ? 'text-cyber-secondary' : 'text-paper-ink'}`}>
                                Select Activity
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {PREDEFINED_TAGS.map(t => (
                                    <button
                                        key={t}
                                        disabled={isActive}
                                        onClick={() => { setSelectedTag(t); setSelectedProject(null); }}
                                        className={`px-3 py-1 text-sm font-bold transition-all
                                            ${selectedTag === t && !selectedProject ? 'opacity-100 scale-110' : 'opacity-40'}
                                            ${theme === 'cyberpunk' ? 'bg-cyber-dark text-white border border-cyber-secondary' : 'bg-paper-highlight text-paper-ink sketchy-box border-2 border-paper-ink'}
                                        `}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className={`text-xs font-bold uppercase mb-4 ${theme === 'cyberpunk' ? 'text-cyber-secondary' : 'text-paper-ink'}`}>
                                Active Projects
                            </h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {projects.map(p => (
                                    <div
                                        key={p.id}
                                        onClick={() => !isActive && setSelectedProject(p)}
                                        className={`p-3 cursor-pointer transition-all border-l-4
                                            ${selectedProject?.id === p.id ? 'pl-6 border-current opacity-100' : 'opacity-40 hover:opacity-70 border-transparent'}
                                            ${theme === 'cyberpunk' ? 'bg-cyber-dark/30 text-cyber-accent' : 'bg-white/50 text-paper-ink'}
                                        `}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-sm truncate">{p.name}</span>
                                            <span className="text-[10px]">{Math.round(p.progress)}%</span>
                                        </div>
                                        <ProgressBar progress={p.progress} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: The Timer */}
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className={`
                            relative w-80 h-80 rounded-full flex flex-col items-center justify-center transition-all duration-500
                            ${theme === 'cyberpunk' ? 'bg-cyber-dark border-4 border-cyber-primary shadow-[0_0_30px_rgba(255,0,85,0.2)]' : 'bg-white border-4 border-paper-ink sketchy-border'}
                        `}>
                            <div className={`text-xs uppercase mb-2 tracking-widest font-bold ${mode === 'rest' ? 'text-green-500' : 'text-current opacity-50'}`}>
                                {mode === 'focus' ? 'Focus Time' : 'Deep Rest'}
                            </div>
                            <div className={`text-7xl font-black mb-4 ${theme === 'cyberpunk' ? 'font-mono text-white' : 'text-paper-ink'}`}>
                                {formatTime(timeLeft)}
                            </div>
                            <div className="text-xs opacity-60 font-medium italic">
                                "{selectedProject ? selectedProject.name : selectedTag}"
                            </div>
                        </div>

                        <div className="flex gap-4 mt-12 w-full max-w-sm">
                            {!isActive ? (
                                <button
                                    onClick={handleStart}
                                    className={`flex-1 py-4 text-xl font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95
                                        ${theme === 'cyberpunk' ? 'bg-cyber-primary text-black shadow-lg' : 'bg-paper-ink text-white sketchy-box'}
                                    `}
                                >
                                    Start Session
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleCancel}
                                        className={`flex-1 py-4 text-xl font-bold uppercase tracking-widest transition-all bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white
                                            ${theme === 'paper' ? 'sketchy-box border-2 border-red-500' : ''}
                                        `}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSessionEnd}
                                        className={`flex-1 py-4 text-xl font-bold uppercase tracking-widest transition-all bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white
                                            ${theme === 'paper' ? 'sketchy-box border-2 border-green-500' : ''}
                                        `}
                                    >
                                        Finish
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto pb-10">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-black tracking-tighter uppercase">Productivity Stats</h2>
                        <button
                            onClick={fetchReports}
                            className={`p-2 rounded-full hover:rotate-180 transition-all duration-500 ${theme === 'cyberpunk' ? 'text-cyber-primary' : 'text-paper-ink'}`}
                            title="Refresh Data"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>
                        </button>
                    </div>

                    {loadingReports ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50 space-y-4">
                            <div className={`w-8 h-8 border-4 border-t-transparent rounded-full animate-spin ${theme === 'cyberpunk' ? 'border-cyber-primary' : 'border-paper-ink'}`}></div>
                            <div className="font-bold tracking-widest text-xs uppercase">Syncing productivity data...</div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-12">
                            <div>
                                <h3 className="text-xl font-bold mb-6 opacity-70">Reports by Tag</h3>
                                <div className="space-y-4">
                                    {reports.by_tag.map(item => (
                                        <div key={item.tag} className={`p-4 rounded border-l-4 ${theme === 'cyberpunk' ? 'bg-cyber-dark/50 border-cyber-secondary' : 'bg-white border-paper-ink'}`}>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold">{item.tag}</span>
                                                <span className="font-mono text-lg">{Math.round(item.total_minutes)} min</span>
                                            </div>
                                        </div>
                                    ))}
                                    {reports.by_tag.length === 0 && <div className="opacity-40 italic">No data yet. Plant some focus seeds.</div>}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-6 opacity-70">Reports by Project</h3>
                                <div className="space-y-4">
                                    {reports.by_project.map(item => (
                                        <div key={item.project__name} className={`p-4 rounded border-l-4 ${theme === 'cyberpunk' ? 'bg-cyber-dark/50 border-cyber-accent' : 'bg-white border-paper-red'}`}>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold">{item.project__name}</span>
                                                <span className="font-mono text-lg">{Math.round(item.total_minutes)} min</span>
                                            </div>
                                        </div>
                                    ))}
                                    {reports.by_project.length === 0 && <div className="opacity-40 italic">No project focus recorded.</div>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ForestView;
