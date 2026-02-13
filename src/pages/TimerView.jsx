import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTimer } from '../context/TimerContext';
import { api } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import Heatmap from '../components/Heatmap';
import WeeklyHistogram from '../components/WeeklyHistogram';

const PREDEFINED_TAGS = ['Trabajo', 'Estudio', 'Ejercicio', 'Lectura', 'Meditación', 'Ocio'];

const TimerView = () => {
    const { theme } = useTheme();
    const {
        timeLeft, isActive, mode, customDuration, setCustomDuration,
        selectedTag, setSelectedTag, selectedProject, setSelectedProject,
        handleStart, handleCancel, handleSessionEnd
    } = useTimer();
    const [view, setView] = useState('timer');
    const [projects, setProjects] = useState([]);
    const [loadingReports, setLoadingReports] = useState(false);
    const [reports, setReports] = useState({ by_tag: [], by_project: [], daily_stats: [] });

    useEffect(() => {
        fetchProjects();
        if (view === 'reports') fetchReports();
    }, [view]);

    const fetchProjects = async () => {
        try {
            const data = await api.get('/projects/');
            setProjects(data.filter(p => p.progress >= 0 && p.progress < 100));
        } catch (e) { console.error(e); }
    };

    const fetchReports = async () => {
        setLoadingReports(true);
        try {
            const data = await api.get('/focus-sessions/reports/');
            setReports(data || { by_tag: [], by_project: [], daily_stats: [] });
        } catch (e) { console.error(e); }
        finally { setLoadingReports(false); }
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
                                Set Duration (min)
                            </h3>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="1"
                                    max="120"
                                    value={customDuration}
                                    disabled={isActive}
                                    onChange={(e) => setCustomDuration(parseInt(e.target.value))}
                                    className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer ${theme === 'cyberpunk' ? 'bg-cyber-primary/20 accent-cyber-primary' : 'bg-paper-ink/20 accent-paper-ink'}`}
                                />
                                <span className="font-black text-xl w-10">{customDuration}</span>
                            </div>
                        </div>

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
                                            ${selectedTag === t && !selectedProject ? 'opacity-100 scale-110' : 'opacity-100'}
                                            ${theme === 'cyberpunk'
                                                ? (selectedTag === t && !selectedProject ? 'bg-cyber-primary text-black border-cyber-primary' : 'bg-cyber-dark text-white border-cyber-primary/30 opacity-60 hover:opacity-100')
                                                : (selectedTag === t && !selectedProject ? 'bg-paper-highlight border-paper-ink' : 'bg-white border-paper-ink/30 opacity-60 hover:opacity-100')
                                            }
                                            border-2 rounded-md
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
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar scrollbar-hide">
                                {projects.map(p => (
                                    <div
                                        key={p.id}
                                        onClick={() => !isActive && setSelectedProject(p)}
                                        className={`p-3 cursor-pointer transition-all border-l-4 rounded-r-md
                                            ${selectedProject?.id === p.id
                                                ? 'pl-6 border-cyber-secondary bg-cyber-secondary/10 opacity-100'
                                                : 'opacity-60 hover:opacity-100 border-transparent bg-white/5'}
                                            ${theme === 'cyberpunk' ? 'text-cyber-accent' : 'text-paper-ink'}
                                        `}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-sm truncate">{p.name}</span>
                                            <span className="text-[10px]">{Math.round(p.progress)}%</span>
                                        </div>
                                        <ProgressBar progress={p.progress} />
                                    </div>
                                ))}
                                {projects.length === 0 && (
                                    <div className="text-xs opacity-50 italic">No hay proyectos activos (0-99%)</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: The Timer */}
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className={`
                            relative w-72 h-72 sm:w-80 sm:h-80 rounded-full flex flex-col items-center justify-center transition-all duration-500
                            ${theme === 'cyberpunk' ? 'bg-cyber-dark border-4 border-cyber-primary shadow-[0_0_40px_rgba(255,0,85,0.3)]' : 'bg-white border-4 border-paper-ink sketchy-border'}
                        `}>
                            <div className={`text-xs uppercase mb-2 tracking-widest font-extrabold ${mode === 'rest' ? 'text-green-400' : 'text-red-500'}`}>
                                {mode === 'focus' ? 'Focus Time' : 'Deep Rest'}
                            </div>
                            <div className={`text-7xl font-black mb-4 ${theme === 'cyberpunk' ? 'font-mono text-white' : 'text-paper-ink'}`}>
                                {formatTime(timeLeft)}
                            </div>
                            <div className="text-xs opacity-60 font-bold uppercase tracking-tighter max-w-[200px] truncate">
                                {selectedProject ? selectedProject.name : selectedTag}
                            </div>
                        </div>

                        <div className="flex gap-4 mt-12 w-full max-w-sm">
                            {!isActive ? (
                                <button
                                    onClick={handleStart}
                                    className={`flex-1 py-4 text-xl font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95
                                        ${theme === 'cyberpunk' ? 'bg-cyber-primary text-black shadow-lg shadow-cyber-primary/40' : 'bg-paper-ink text-white sketchy-box'}
                                    `}
                                >
                                    {mode === 'focus' ? 'Start Focus' : 'Start Rest'}
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleCancel}
                                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all bg-red-500/10 text-red-500 border-2 border-red-500/30 hover:bg-red-500 hover:text-white rounded-lg
                                            ${theme === 'paper' ? 'sketchy-box' : ''}
                                        `}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSessionEnd}
                                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all bg-green-500/10 text-green-500 border-2 border-green-500/30 hover:bg-green-500 hover:text-white rounded-lg
                                            ${theme === 'paper' ? 'sketchy-box' : ''}
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
                <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar">
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
                            <div className="font-bold tracking-widest text-xs uppercase text-center">Syncing data...</div>
                        </div>
                    ) : (
                        <div className="space-y-16">
                            {/* Heatmap Section */}
                            <section>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-6 flex items-center gap-2">
                                    <span className={`w-8 h-1 ${theme === 'cyberpunk' ? 'bg-cyber-primary' : 'bg-paper-ink'}`}></span>
                                    Productivity Heatmap
                                </h3>
                                <div className={`p-6 rounded-xl border ${theme === 'cyberpunk' ? 'bg-cyber-dark/30 border-white/5' : 'bg-white border-paper-ink/10'}`}>
                                    <Heatmap stats={reports.daily_stats} />
                                </div>
                            </section>

                            <div className="grid lg:grid-cols-3 gap-12">
                                {/* Histogram Section */}
                                <section className="lg:col-span-2">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-6 flex items-center gap-2">
                                        <span className={`w-8 h-1 ${theme === 'cyberpunk' ? 'bg-cyber-secondary' : 'bg-paper-ink'}`}></span>
                                        Last 7 Days
                                    </h3>
                                    <div className={`p-6 rounded-xl border h-full ${theme === 'cyberpunk' ? 'bg-cyber-dark/30 border-white/5' : 'bg-white border-paper-ink/10'}`}>
                                        <WeeklyHistogram stats={reports.daily_stats} />
                                    </div>
                                </section>

                                {/* Totals Section */}
                                <section className="space-y-8">
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">By Tag</h3>
                                        <div className="space-y-2">
                                            {reports.by_tag?.map(item => (
                                                <div key={item.tag} className={`p-3 rounded-lg flex justify-between items-center text-sm ${theme === 'cyberpunk' ? 'bg-white/5' : 'bg-white border border-paper-ink/5'}`}>
                                                    <span className="font-bold uppercase opacity-70">{item.tag}</span>
                                                    <span className="font-black">{Math.round(item.total_minutes)}m</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">By Project</h3>
                                        <div className="space-y-2">
                                            {reports.by_project?.map(item => (
                                                <div key={item.project__name} className={`p-3 rounded-lg flex justify-between items-center text-sm ${theme === 'cyberpunk' ? 'bg-white/5' : 'bg-white border border-paper-ink/5'}`}>
                                                    <span className="font-bold uppercase opacity-70">{item.project__name}</span>
                                                    <span className="font-black">{Math.round(item.total_minutes)}m</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TimerView;
