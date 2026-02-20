import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTimer } from '../context/TimerContext';
import { api } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import Heatmap from '../components/Heatmap';
import WeeklyHistogram from '../components/WeeklyHistogram';
import { RefreshCw } from 'lucide-react';

const PREDEFINED_TAGS = ['Trabajo', 'Estudio', 'Ejercicio', 'Lectura', 'Meditación', 'Ocio'];

// ── Theme token map ────────────────────────────────────────────────────────────
const t4 = (theme, map) => map[theme] || map.dark;

const getS = (theme) => ({
    // Tab bar
    tabBorder: t4(theme, { cyberpunk: 'border-cyber-primary/20', paper: 'border-paper-ink/20', dark: 'border-dark-border', sakura: 'border-sakura-blossom/30' }),
    tabActive: t4(theme, { cyberpunk: 'text-cyber-secondary', paper: 'text-paper-ink', dark: 'text-dark-text', sakura: 'text-sakura-ink' }),
    tabInactive: t4(theme, { cyberpunk: 'text-cyber-secondary/35 hover:text-cyber-secondary/70', paper: 'text-paper-ink/35 hover:text-paper-ink/70', dark: 'text-dark-muted hover:text-dark-subtle', sakura: 'text-sakura-muted hover:text-sakura-subtle' }),

    // Labels / section headings
    label: t4(theme, { cyberpunk: 'text-cyber-secondary/60', paper: 'text-paper-ink/60', dark: 'text-dark-muted', sakura: 'text-sakura-muted' }),

    // Range slider
    slider: t4(theme, { cyberpunk: 'accent-cyber-primary bg-cyber-primary/20', paper: 'accent-paper-ink bg-paper-ink/20', dark: 'accent-dark-primary bg-dark-primary/20', sakura: 'accent-sakura-deep bg-sakura-blossom/30' }),
    sliderNum: t4(theme, { cyberpunk: 'text-cyber-secondary', paper: 'text-paper-ink', dark: 'text-dark-text', sakura: 'text-sakura-ink' }),

    // Tag buttons
    tagActive: t4(theme, { cyberpunk: 'bg-cyber-primary text-black border-cyber-primary', paper: 'bg-paper-highlight border-paper-ink text-paper-ink', dark: 'bg-dark-primary text-white border-dark-primary', sakura: 'bg-sakura-deep text-white border-sakura-deep' }),
    tagInactive: t4(theme, { cyberpunk: 'bg-cyber-dark text-cyber-secondary/60 border-cyber-primary/30 hover:border-cyber-primary/60 hover:text-cyber-secondary', paper: 'bg-white text-paper-ink/50 border-paper-ink/25 hover:border-paper-ink/60 hover:text-paper-ink', dark: 'bg-dark-elevated text-dark-muted border-dark-border hover:border-dark-primary/50 hover:text-dark-text', sakura: 'bg-sakura-surface text-sakura-muted border-sakura-blossom/30 hover:border-sakura-deep/50 hover:text-sakura-ink' }),

    // Project items
    projectActive: t4(theme, { cyberpunk: 'border-cyber-secondary bg-cyber-secondary/10 text-cyber-accent', paper: 'border-paper-ink bg-paper-highlight text-paper-ink', dark: 'border-dark-primary bg-dark-primary/10 text-dark-text', sakura: 'border-sakura-deep bg-sakura-blossom/20 text-sakura-ink' }),
    projectDefault: t4(theme, { cyberpunk: 'border-transparent bg-white/5 text-cyber-secondary/70', paper: 'border-transparent bg-black/5 text-paper-ink/70', dark: 'border-transparent bg-dark-elevated text-dark-subtle', sakura: 'border-transparent bg-sakura-petal/30 text-sakura-subtle' }),

    // Clock face
    clock: t4(theme, { cyberpunk: 'bg-cyber-dark border-4 border-cyber-primary shadow-[0_0_40px_rgba(255,0,85,0.3)]', paper: 'bg-white border-4 border-paper-ink sketchy-border', dark: 'bg-dark-surface border-2 border-dark-border shadow-[0_0_32px_rgba(124,109,250,0.12)]', sakura: 'bg-white border-2 border-sakura-blossom shadow-[0_0_24px_rgba(232,87,122,0.15)]' }),
    clockNum: t4(theme, { cyberpunk: 'font-mono text-white', paper: 'text-paper-ink', dark: 'text-dark-text', sakura: 'text-sakura-ink' }),
    clockSub: t4(theme, { cyberpunk: 'text-cyber-secondary/50', paper: 'text-paper-ink/50', dark: 'text-dark-muted', sakura: 'text-sakura-muted' }),

    // Start button
    btnStart: t4(theme, { cyberpunk: 'bg-cyber-primary text-black shadow-lg shadow-cyber-primary/40', paper: 'bg-paper-ink text-white sketchy-box', dark: 'bg-dark-primary text-white shadow-lg shadow-dark-primary/30 rounded-xl', sakura: 'bg-sakura-deep text-white shadow-lg shadow-sakura-deep/30 rounded-xl' }),

    // Reports title
    reportTitle: t4(theme, { cyberpunk: 'text-cyber-secondary', paper: 'text-paper-ink', dark: 'text-dark-text', sakura: 'text-sakura-ink' }),
    reportRefresh: t4(theme, { cyberpunk: 'text-cyber-primary hover:text-cyber-accent', paper: 'text-paper-ink', dark: 'text-dark-primary hover:text-dark-accent', sakura: 'text-sakura-deep hover:text-sakura-blossom' }),
    sectionLine: t4(theme, { cyberpunk: 'bg-cyber-primary', paper: 'bg-paper-ink', dark: 'bg-dark-primary', sakura: 'bg-sakura-blossom' }),

    // Chart containers
    chartCard: t4(theme, { cyberpunk: 'bg-cyber-dark/30 border-white/5', paper: 'bg-white border-paper-ink/10', dark: 'bg-dark-surface border-dark-border', sakura: 'bg-white border-sakura-blossom/20' }),

    // Stats rows
    statRow: t4(theme, { cyberpunk: 'bg-white/5 text-cyber-secondary', paper: 'bg-white border border-paper-ink/5 text-paper-ink', dark: 'bg-dark-elevated border border-dark-border text-dark-text', sakura: 'bg-sakura-surface border border-sakura-blossom/20 text-sakura-ink' }),
    statLabel: t4(theme, { cyberpunk: 'text-cyber-secondary/70', paper: 'text-paper-ink/70', dark: 'text-dark-subtle', sakura: 'text-sakura-subtle' }),
    statValue: t4(theme, { cyberpunk: 'text-cyber-primary', paper: 'text-paper-ink', dark: 'text-dark-primary', sakura: 'text-sakura-deep' }),
    sectionHead: t4(theme, { cyberpunk: 'text-cyber-secondary/40', paper: 'text-paper-ink/40', dark: 'text-dark-muted', sakura: 'text-sakura-muted' }),
});

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

    const s = getS(theme);

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

            {/* ── Tabs ── */}
            <div className={`flex gap-6 mb-12 border-b pb-4 ${s.tabBorder}`}>
                <button
                    onClick={() => setView('timer')}
                    className={`text-2xl font-bold transition-all ${view === 'timer' ? `${s.tabActive} scale-105` : s.tabInactive}`}
                >
                    TIMER
                </button>
                <button
                    onClick={() => setView('reports')}
                    className={`text-2xl font-bold transition-all ${view === 'reports' ? `${s.tabActive} scale-105` : s.tabInactive}`}
                >
                    REPORTS
                </button>
            </div>

            {view === 'timer' ? (
                <div className="flex-1 flex flex-col lg:flex-row gap-12 items-center justify-center">

                    {/* ── Left: Controls ── */}
                    <div className="w-full lg:w-80 space-y-8">

                        {/* Duration */}
                        <div>
                            <h3 className={`text-xs font-bold uppercase mb-4 tracking-widest ${s.label}`}>
                                Set Duration (min)
                            </h3>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range" min="1" max="120"
                                    value={customDuration}
                                    disabled={isActive}
                                    onChange={(e) => setCustomDuration(parseInt(e.target.value))}
                                    className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer ${s.slider}`}
                                />
                                <span className={`font-black text-xl w-10 ${s.sliderNum}`}>{customDuration}</span>
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <h3 className={`text-xs font-bold uppercase mb-4 tracking-widest ${s.label}`}>
                                Select Activity
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {PREDEFINED_TAGS.map(t => (
                                    <button
                                        key={t}
                                        disabled={isActive}
                                        onClick={() => { setSelectedTag(t); setSelectedProject(null); }}
                                        className={`px-3 py-1.5 text-sm font-bold transition-all border-2 rounded-md
                                            ${selectedTag === t && !selectedProject
                                                ? s.tagActive
                                                : s.tagInactive}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Projects */}
                        <div>
                            <h3 className={`text-xs font-bold uppercase mb-4 tracking-widest ${s.label}`}>
                                Active Projects
                            </h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                {projects.map(p => (
                                    <div
                                        key={p.id}
                                        onClick={() => !isActive && setSelectedProject(p)}
                                        className={`p-3 cursor-pointer transition-all border-l-4 rounded-r-md
                                            ${selectedProject?.id === p.id ? s.projectActive : s.projectDefault}`}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-sm truncate">{p.name}</span>
                                            <span className="text-[10px] opacity-60">{Math.round(p.progress)}%</span>
                                        </div>
                                        <ProgressBar progress={p.progress} />
                                    </div>
                                ))}
                                {projects.length === 0 && (
                                    <div className={`text-xs italic ${s.label}`}>No hay proyectos activos (0-99%)</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Timer face ── */}
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className={`relative w-72 h-72 sm:w-80 sm:h-80 rounded-full flex flex-col items-center justify-center transition-all duration-500 ${s.clock}`}>
                            <div className={`text-xs uppercase mb-2 tracking-widest font-extrabold ${mode === 'rest' ? 'text-green-400' : 'text-red-500'}`}>
                                {mode === 'focus' ? 'Focus Time' : 'Deep Rest'}
                            </div>
                            <div className={`text-7xl font-black mb-4 ${s.clockNum}`}>
                                {formatTime(timeLeft)}
                            </div>
                            <div className={`text-xs font-bold uppercase tracking-tighter max-w-[200px] truncate ${s.clockSub}`}>
                                {selectedProject ? selectedProject.name : selectedTag}
                            </div>
                        </div>

                        <div className="flex gap-4 mt-12 w-full max-w-sm">
                            {!isActive ? (
                                <button
                                    onClick={handleStart}
                                    className={`flex-1 py-4 text-xl font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${s.btnStart}`}
                                >
                                    {mode === 'focus' ? 'Start Focus' : 'Start Rest'}
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleCancel}
                                        className="flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all bg-red-500/10 text-red-400 border-2 border-red-500/30 hover:bg-red-500 hover:text-white rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSessionEnd}
                                        className="flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all bg-green-500/10 text-green-400 border-2 border-green-500/30 hover:bg-green-500 hover:text-white rounded-lg"
                                    >
                                        Finish
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

            ) : (
                /* ── Reports ── */
                <div className="flex-1 overflow-y-auto pb-10">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className={`text-3xl font-black tracking-tighter uppercase ${s.reportTitle}`}>
                            Productivity Stats
                        </h2>
                        <button
                            onClick={fetchReports}
                            className={`p-2 rounded-full hover:rotate-180 transition-all duration-500 ${s.reportRefresh}`}
                            title="Refresh Data"
                        >
                            <RefreshCw size={20} strokeWidth={2.5} />
                        </button>
                    </div>

                    {loadingReports ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className={`w-8 h-8 border-4 border-t-transparent rounded-full animate-spin ${theme === 'cyberpunk' ? 'border-cyber-primary' :
                                    theme === 'dark' ? 'border-dark-primary' :
                                        theme === 'sakura' ? 'border-sakura-deep' :
                                            'border-paper-ink'
                                }`} />
                            <div className={`font-bold tracking-widest text-xs uppercase ${s.label}`}>Syncing data...</div>
                        </div>
                    ) : (
                        <div className="space-y-16">
                            {/* Heatmap */}
                            <section>
                                <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 ${s.sectionHead}`}>
                                    <span className={`w-8 h-1 inline-block ${s.sectionLine}`} />
                                    Productivity Heatmap
                                </h3>
                                <div className={`p-6 rounded-xl border ${s.chartCard}`}>
                                    <Heatmap stats={reports.daily_stats} />
                                </div>
                            </section>

                            <div className="grid lg:grid-cols-3 gap-12">
                                {/* Histogram */}
                                <section className="lg:col-span-2">
                                    <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 ${s.sectionHead}`}>
                                        <span className={`w-8 h-1 inline-block ${s.sectionLine}`} />
                                        Last 7 Days
                                    </h3>
                                    <div className={`p-6 rounded-xl border h-full ${s.chartCard}`}>
                                        <WeeklyHistogram stats={reports.daily_stats} />
                                    </div>
                                </section>

                                {/* Totals */}
                                <section className="space-y-8">
                                    <div>
                                        <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 ${s.sectionHead}`}>By Tag</h3>
                                        <div className="space-y-2">
                                            {reports.by_tag?.map(item => (
                                                <div key={item.tag} className={`p-3 rounded-lg flex justify-between items-center text-sm ${s.statRow}`}>
                                                    <span className={`font-bold uppercase ${s.statLabel}`}>{item.tag}</span>
                                                    <span className={`font-black ${s.statValue}`}>{Math.round(item.total_minutes)}m</span>
                                                </div>
                                            ))}
                                            {!reports.by_tag?.length && (
                                                <p className={`text-xs italic ${s.label}`}>Sin datos aún</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 ${s.sectionHead}`}>By Project</h3>
                                        <div className="space-y-2">
                                            {reports.by_project?.map(item => (
                                                <div key={item.project__name} className={`p-3 rounded-lg flex justify-between items-center text-sm ${s.statRow}`}>
                                                    <span className={`font-bold uppercase ${s.statLabel}`}>{item.project__name}</span>
                                                    <span className={`font-black ${s.statValue}`}>{Math.round(item.total_minutes)}m</span>
                                                </div>
                                            ))}
                                            {!reports.by_project?.length && (
                                                <p className={`text-xs italic ${s.label}`}>Sin datos aún</p>
                                            )}
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
