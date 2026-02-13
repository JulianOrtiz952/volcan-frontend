import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import ProgressBar from './ProgressBar';
import { api } from '../services/api';
import ConfirmModal from './ConfirmModal';

// --- Sub-components ---

const SubtaskItem = ({ subtask, onToggle, onUpdate, onDelete, theme }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(subtask.title);

    const handleUpdate = async () => {
        if (!editTitle.trim() || editTitle === subtask.title) {
            setIsEditing(false);
            setEditTitle(subtask.title);
            return;
        }
        try {
            await api.patch(`/subtasks/${subtask.id}/`, { title: editTitle });
            setIsEditing(false);
            onUpdate();
        } catch (e) {
            console.error(e);
            setEditTitle(subtask.title);
        }
    };

    return (
        <div key={subtask.id} className="flex items-center justify-between group/sub">
            <div
                className="flex items-center text-sm opacity-80 cursor-pointer hover:opacity-100 transition-opacity py-1 flex-1 min-w-0"
                onClick={() => !isEditing && onToggle(subtask.id)}
            >
                <div className={`w-4 h-4 mr-2 border flex items-center justify-center transition-all flex-shrink-0
                    ${subtask.completed ? 'bg-current' : 'transparent'}
                    ${theme === 'cyberpunk' ? 'border-cyber-secondary text-cyber-secondary' : 'border-paper-ink text-paper-ink rounded-sm'}
                `}>
                    {subtask.completed && '✓'}
                </div>
                {isEditing ? (
                    <input
                        autoFocus
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        onBlur={handleUpdate}
                        onKeyDown={e => e.key === 'Enter' && handleUpdate()}
                        onClick={e => e.stopPropagation()}
                        className={`bg-transparent border-b border-current outline-none w-full mr-2
                            ${theme === 'cyberpunk' ? 'text-white' : 'text-black'}
                        `}
                    />
                ) : (
                    <span className={`${subtask.completed ? 'line-through opacity-50' : ''} break-words truncate`}>{subtask.title}</span>
                )}
            </div>
            {!isEditing && (
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                        className={`opacity-0 group-hover/sub:opacity-100 transition-opacity p-1 text-xs
                            ${theme === 'cyberpunk' ? 'text-cyber-muted hover:text-white' : 'text-paper-ink/50 hover:text-paper-ink'}
                        `}
                        title="Editar subtarea"
                    >
                        ✎
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(subtask.id); }}
                        className={`opacity-0 group-hover/sub:opacity-100 transition-opacity p-1
                            ${theme === 'cyberpunk' ? 'text-cyber-secondary hover:text-white' : 'text-paper-ink hover:text-paper-red'}
                        `}
                        title="Eliminar subtarea"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
};

const TaskItem = ({ task, onUpdate, onToggleTask, onToggleSubtask, onDeleteTask, onDeleteSubtask }) => {
    const { theme } = useTheme();
    const [isAddingSubtask, setIsAddingSubtask] = useState(false);
    const [subtaskTitle, setSubtaskTitle] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);

    const toggleComplete = async () => {
        onToggleTask(task.id, task.completed);
    };

    const toggleSubtask = async (subId) => {
        onToggleSubtask(task.id, subId, task.subtasks.find(s => s.id === subId).completed);
    };

    const handleUpdateTask = async () => {
        if (!editTitle.trim() || editTitle === task.title) {
            setIsEditing(false);
            setEditTitle(task.title);
            return;
        }
        try {
            await api.patch(`/tasks/${task.id}/`, { title: editTitle });
            setIsEditing(false);
            onUpdate();
        } catch (e) {
            console.error(e);
            setEditTitle(task.title);
        }
    };

    const handleAddSubtask = async (e) => {
        e.preventDefault();
        if (!subtaskTitle.trim()) return;
        try {
            await api.post('/subtasks/', { task: task.id, title: subtaskTitle });
            setSubtaskTitle('');
            setIsAddingSubtask(false);
            onUpdate();
        } catch (e) { console.error(e); }
    };

    return (
        <div className={`mb-6 p-4 rounded-lg transition-all group
            ${theme === 'cyberpunk' ? 'bg-cyber-dark/30 border border-cyber-muted/30' : 'bg-white/80 border border-paper-line/50 shadow-sm'}
        `}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center flex-1 min-w-0">
                    <label className="flex items-center cursor-pointer select-none flex-1 min-w-0 mr-2">
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={toggleComplete}
                            className={`mr-3 w-5 h-5 appearance-none border transition-all cursor-pointer flex-shrink-0
                              ${task.completed ? 'bg-current border-transparent' : 'bg-transparent'}
                              ${theme === 'cyberpunk' ? 'border-cyber-primary checked:bg-cyber-primary text-cyber-black' : 'border-paper-ink checked:bg-paper-red text-paper-bg rounded-md'}
                            `}
                        />
                        {isEditing ? (
                            <input
                                autoFocus
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                onBlur={handleUpdateTask}
                                onKeyDown={e => e.key === 'Enter' && handleUpdateTask()}
                                onClick={e => e.stopPropagation()}
                                className={`font-bold text-lg bg-transparent border-b border-current outline-none w-full
                                    ${theme === 'cyberpunk' ? 'text-white' : 'text-black'}
                                `}
                            />
                        ) : (
                            <span className={`font-bold text-lg truncate ${task.completed ? 'line-through opacity-50' : ''}`}>
                                {task.title}
                            </span>
                        )}
                    </label>
                    {!isEditing && (
                        <div className="flex items-center">
                            <button
                                onClick={() => setIsEditing(true)}
                                className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 text-sm
                                    ${theme === 'cyberpunk' ? 'text-cyber-muted hover:text-white' : 'text-paper-ink/50 hover:text-paper-ink'}
                                `}
                                title="Editar tarea"
                            >
                                ✎
                            </button>
                            <button
                                onClick={() => onDeleteTask(task.id)}
                                className={`opacity-0 group-hover:opacity-100 transition-opacity p-1
                                    ${theme === 'cyberpunk' ? 'text-cyber-secondary hover:text-white' : 'text-paper-ink hover:text-paper-red'}
                                `}
                                title="Eliminar tarea"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>
                <div className={`text-xs font-mono px-2 py-1 rounded ml-2 flex-shrink-0
                    ${theme === 'cyberpunk' ? 'bg-cyber-dark text-cyber-accent' : 'bg-paper-mark text-paper-ink'}
                `}>
                    {Math.round(task.progress)}%
                </div>
            </div>

            <div className="pl-8 w-full">
                <ProgressBar progress={task.progress} />

                {task.subtasks && task.subtasks.length > 0 && (
                    <div className="mt-4 space-y-2 border-l-2 pl-4 py-2" style={{ borderColor: theme === 'cyberpunk' ? 'rgba(0,204,255,0.2)' : 'rgba(0,0,0,0.1)' }}>
                        {[...task.subtasks]
                            .sort((a, b) => {
                                if (a.completed === b.completed) {
                                    return new Date(a.created_at) - new Date(b.created_at);
                                }
                                return a.completed ? 1 : -1;
                            })
                            .map(sub => (
                                <SubtaskItem
                                    key={sub.id}
                                    subtask={sub}
                                    onToggle={toggleSubtask}
                                    onUpdate={onUpdate}
                                    onDelete={onDeleteSubtask}
                                    theme={theme}
                                />
                            ))}
                    </div>
                )}

                {/* Add Subtask Area */}
                <div className="mt-3">
                    {isAddingSubtask ? (
                        <form onSubmit={handleAddSubtask} className="flex gap-2">
                            <input
                                autoFocus
                                type="text"
                                value={subtaskTitle}
                                onChange={e => setSubtaskTitle(e.target.value)}
                                placeholder="Subtask..."
                                className={`flex-1 text-sm px-2 py-1 rounded outline-none border
                                    ${theme === 'cyberpunk' ? 'bg-cyber-black border-cyber-muted text-white' : 'bg-white border-paper-line text-black'}
                                `}
                            />
                            <button type="submit" className="text-xs font-bold px-2 uppercase hover:opacity-80">Add</button>
                            <button type="button" onClick={() => setIsAddingSubtask(false)} className="text-xs opacity-50 hover:opacity-100">Cancel</button>
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsAddingSubtask(true)}
                            className={`text-xs px-2 py-1 opacity-60 hover:opacity-100 flex items-center gap-1 transition-all
                                ${theme === 'cyberpunk' ? 'text-cyber-secondary hover:translate-x-1' : 'text-paper-ink hover:translate-x-1'}
                            `}
                        >
                            + Add Subtask
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Create/Edit Project Modal ---

const ProjectModal = ({ onClose, onSave, theme, editingProject = null }) => {
    const [name, setName] = useState(editingProject?.name || '');
    const [desc, setDesc] = useState(editingProject?.description || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave(name, desc);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`relative w-full max-w-md p-8 shadow-2xl transition-all scale-100
                ${theme === 'cyberpunk' ? 'bg-cyber-dark border-2 border-cyber-primary' : 'bg-paper-bg border-4 border-paper-ink rotate-1'}
             `}>
                <h2 className={`text-2xl font-bold mb-6 text-center uppercase tracking-widest
                    ${theme === 'cyberpunk' ? 'text-cyber-primary' : 'text-paper-ink scribble-underline'}
                `}>{editingProject ? 'Edit Project' : 'New Project'}</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className={`block text-xs font-bold uppercase mb-2 ${theme === 'cyberpunk' ? 'text-cyber-secondary' : 'text-paper-ink'}`}>Project Name</label>
                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className={`w-full p-3 rounded outline-none transition-all border-2
                                ${theme === 'cyberpunk' ? 'bg-cyber-black border-cyber-muted focus:border-cyber-primary text-white' : 'bg-white border-paper-line focus:border-paper-ink text-black sketchy-input'}
                            `}
                            placeholder="e.g., Website Redesign"
                        />
                    </div>

                    <div>
                        <label className={`block text-xs font-bold uppercase mb-2 ${theme === 'cyberpunk' ? 'text-cyber-secondary' : 'text-paper-ink'}`}>Description (Optional)</label>
                        <textarea
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            rows="3"
                            className={`w-full p-3 rounded outline-none transition-all border-2
                                ${theme === 'cyberpunk' ? 'bg-cyber-black border-cyber-muted focus:border-cyber-primary text-white' : 'bg-white border-paper-line focus:border-paper-ink text-black sketchy-input'}
                            `}
                            placeholder="What's this project about?"
                        />
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 py-3 font-bold uppercase tracking-wider hover:opacity-80 transition-opacity
                                ${theme === 'cyberpunk' ? 'bg-cyber-muted/20 text-white' : 'bg-gray-200 text-gray-700'}
                            `}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className={`flex-1 py-3 font-bold uppercase tracking-wider hover:scale-[1.02] transition-transform
                                ${theme === 'cyberpunk' ? 'bg-cyber-primary text-black' : 'bg-paper-ink text-white sketchy-box'}
                            `}
                        >
                            {editingProject ? 'Save' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProjectCarousel = ({ projects, title, theme, isPersonal, onSelect, selectedProjectId }) => {
    const scrollRef = useRef(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeft(scrollLeft > 20);
            setShowRight(scrollLeft < scrollWidth - clientWidth - 20);
        }
    };

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { clientWidth } = scrollRef.current;
            const move = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
            scrollRef.current.scrollBy({ left: move, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        handleScroll();
        window.addEventListener('resize', handleScroll);
        return () => window.removeEventListener('resize', handleScroll);
    }, [projects]);

    const colors = theme === 'cyberpunk'
        ? ['border-cyber-primary text-cyber-primary', 'border-cyber-secondary text-cyber-secondary', 'border-cyber-accent text-cyber-accent']
        : ['border-paper-red text-paper-red', 'border-blue-500 text-blue-500', 'border-green-600 text-green-600', 'border-yellow-600 text-yellow-600'];

    // Simple hash to pick a consistent color for the title
    const colorIndex = Math.abs(title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
    const colorClass = colors[colorIndex];

    return (
        <div className="mb-10 group/carousel relative scale-100 transition-transform duration-300">
            <h2 className={`text-xl font-bold mb-4 uppercase tracking-widest pl-3 border-l-4 transition-colors duration-500 ${colorClass}`}>
                {title}
            </h2>

            <div className="relative">
                {showLeft && (
                    <button
                        onClick={(e) => { e.stopPropagation(); scroll('left'); }}
                        className={`absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 active:scale-95
                            ${theme === 'cyberpunk' ? 'bg-cyber-primary text-black' : 'bg-paper-ink text-white sketchy-box'}
                        `}
                    >
                        ←
                    </button>
                )}

                {showRight && (
                    <button
                        onClick={(e) => { e.stopPropagation(); scroll('right'); }}
                        className={`absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 active:scale-95
                            ${theme === 'cyberpunk' ? 'bg-cyber-primary text-black' : 'bg-paper-ink text-white sketchy-box'}
                        `}
                    >
                        →
                    </button>
                )}

                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex gap-6 overflow-x-auto scrollbar-hide pb-6 px-2 -mx-2 snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => isPersonal && onSelect(project)}
                            className={`
                                min-w-[280px] max-w-[280px] shrink-0 snap-start
                                relative p-4 transition-all duration-200
                                ${isPersonal ? 'cursor-pointer' : 'cursor-default'}
                                ${selectedProjectId === project.id
                                    ? `border-l-4 pl-4 ${theme === 'cyberpunk' ? 'bg-cyber-dark/50 border-cyber-primary' : 'bg-paper-highlight/20 border-paper-red'}`
                                    : `${isPersonal ? 'hover:scale-[1.02] hover:opacity-90' : ''} ${theme === 'cyberpunk' ? 'hover:bg-cyber-dark/30' : 'hover:bg-black/5'}`
                                }
                                ${theme === 'paper' ? 'sketchy-border border-2 border-paper-ink h-32 flex flex-col justify-between' : 'border border-cyber-secondary h-32 flex flex-col justify-between bg-cyber-black'}
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <h3 className={`font-bold truncate ${selectedProjectId ? 'text-xs' : 'text-lg'}`}>
                                    {project.name}
                                </h3>
                                <div className="flex flex-col items-end">
                                    {!isPersonal && (
                                        <span className={`text-[9px] opacity-60 mb-1 uppercase tracking-tighter ${theme === 'cyberpunk' ? 'text-cyber-secondary' : 'text-paper-ink'}`}>
                                            BY: {project.display_name || project.user_name}
                                        </span>
                                    )}
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${theme === 'cyberpunk' ? 'bg-cyber-dark text-cyber-primary border border-cyber-primary/20' : 'bg-paper-ink text-white'}`}>
                                        {project.status}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-2">
                                <ProgressBar progress={project.progress} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---

const ProjectList = ({ view }) => {
    const { theme } = useTheme();
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    // Confirmation state
    const [confirmState, setConfirmState] = useState({ isOpen: false, type: null, id: null, title: '', message: '' });

    // New Inputs
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const fetchProjects = async (silent = false) => {
        try {
            const endpoint = view === 'community' ? '/projects/community/' : '/projects/';
            const data = await api.get(endpoint);
            setProjects(data);
            // If the selected project was just updated, refresh it too
            if (selectedProject) {
                const updated = data.find(p => p.id === selectedProject.id);
                if (updated) setSelectedProject(updated);
            }
        } catch (err) { console.error(err); }
    };

    const fetchTasks = async (projectId, silent = false) => {
        if (!silent) setLoadingTasks(true);
        try {
            const data = await api.get(`/tasks/?project=${projectId}`);
            // Sort tasks: pending first, then by creation date
            const sortedTasks = data.sort((a, b) => {
                if (a.completed === b.completed) {
                    return new Date(a.created_at) - new Date(b.created_at);
                }
                return a.completed ? 1 : -1;
            });
            setTasks(sortedTasks);
        } catch (e) { console.error(e); }
        finally { if (!silent) setLoadingTasks(false); }
    };


    useEffect(() => {
        fetchProjects();
        setSelectedProject(null); // Reset selection on view change
    }, [view]);

    useEffect(() => {
        if (selectedProject) {
            fetchTasks(selectedProject.id);
        }
    }, [selectedProject?.id]); // Only refetch when ID changes, avoids loops on attribute updates

    const handleToggleTask = async (taskId, currentStatus) => {
        const previousTasks = [...tasks];
        const updatedTasks = tasks.map(t =>
            t.id === taskId ? { ...t, completed: !currentStatus, progress: !currentStatus ? 100 : 0 } : t
        ).sort((a, b) => {
            if (a.completed === b.completed) {
                return new Date(a.created_at) - new Date(b.created_at);
            }
            return a.completed ? 1 : -1;
        });

        setTasks(updatedTasks);

        try {
            await api.patch(`/tasks/${taskId}/`, { completed: !currentStatus });
            await fetchTasks(selectedProject.id, true);
            fetchProjects(true);
        } catch (e) {
            console.error(e);
            setTasks(previousTasks);
        }
    };

    const handleToggleSubtask = async (taskId, subId, currentStatus) => {
        const previousTasks = [...tasks];
        const updatedTasks = tasks.map(t => {
            if (t.id === taskId) {
                const newSubtasks = t.subtasks.map(s =>
                    s.id === subId ? { ...s, completed: !currentStatus } : s
                );
                const completedCount = newSubtasks.filter(s => s.completed).length;
                const newProgress = (completedCount / newSubtasks.length) * 100;
                return { ...t, subtasks: newSubtasks, progress: newProgress };
            }
            return t;
        }).sort((a, b) => {
            if (a.completed === b.completed) {
                return new Date(a.created_at) - new Date(b.created_at);
            }
            return a.completed ? 1 : -1;
        });

        setTasks(updatedTasks);

        try {
            await api.patch(`/subtasks/${subId}/`, { completed: !currentStatus });
            await fetchTasks(selectedProject.id, true);
            fetchProjects(true);
        } catch (e) {
            console.error(e);
            setTasks(previousTasks);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim() || !selectedProject) return;

        try {
            await api.post('/tasks/', {
                project: selectedProject.id,
                title: newTaskTitle,
                description: '',
            });
            setNewTaskTitle('');
            await fetchTasks(selectedProject.id, true);
            fetchProjects(true);
        } catch (e) { console.error(e); }
    };

    const handleSaveProject = async (name, desc) => {
        try {
            if (editingProject) {
                await api.patch(`/projects/${editingProject.id}/`, { name, description: desc });
            } else {
                await api.post('/projects/', { name, description: desc });
            }
            fetchProjects();
            setIsProjectModalOpen(false);
            setEditingProject(null);
        } catch (e) { console.error(e); }
    };

    // Generic confirmation handler
    const triggerConfirm = (type, id, title, message) => {
        setConfirmState({ isOpen: true, type, id, title, message });
    };

    const handleConfirm = async () => {
        const { type, id } = confirmState;
        try {
            if (type === 'project') {
                await api.delete(`/projects/${id}/`);
                setSelectedProject(null);
                fetchProjects();
            } else if (type === 'task') {
                await api.delete(`/tasks/${id}/`);
                fetchTasks(selectedProject.id, true);
                fetchProjects(true);
            } else if (type === 'subtask') {
                await api.delete(`/subtasks/${id}/`);
                fetchTasks(selectedProject.id, true);
                fetchProjects(true);
            }
        } catch (e) { console.error(e); }
        setConfirmState({ ...confirmState, isOpen: false });
    };

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden relative">

            <ConfirmModal
                isOpen={confirmState.isOpen}
                title={confirmState.title}
                message={confirmState.message}
                onConfirm={handleConfirm}
                onCancel={() => setConfirmState({ ...confirmState, isOpen: false })}
            />

            {isProjectModalOpen && (
                <ProjectModal
                    onClose={() => { setIsProjectModalOpen(false); setEditingProject(null); }}
                    onSave={handleSaveProject}
                    theme={theme}
                    editingProject={editingProject}
                />
            )}

            {/* LEFT COLUMN: Sidebar style (Notion-like) */}
            <div className={`
                flex-shrink-0 transition-all duration-300 ease-in-out border-r
                ${selectedProject ? 'w-80' : 'w-full max-w-5xl mx-auto border-r-0'}
                ${theme === 'cyberpunk' ? 'border-cyber-muted/20' : 'border-paper-line/30'}
                flex flex-col
            `}>
                <div className="p-4 flex items-center justify-between">
                    <h2 className={`font-bold uppercase tracking-wider ${theme === 'cyberpunk' ? 'text-cyber-muted' : 'text-paper-ink/50'}`}>
                        Projects
                    </h2>
                    {view === 'personal' && (
                        <button onClick={() => { setEditingProject(null); setIsProjectModalOpen(true); }} className="text-2xl hover:scale-110 transition-transform">+</button>
                    )}
                </div>

                <div className={`overflow-y-auto px-4 pb-10 ${selectedProject ? 'space-y-3' : 'px-8 py-4'}`}>
                    {view === 'community' && !selectedProject ? (
                        // Group by user for community view
                        Object.entries(
                            projects.reduce((acc, p) => {
                                const key = p.display_name || p.user_name || 'Anonymous';
                                if (!acc[key]) acc[key] = [];
                                acc[key].push(p);
                                return acc;
                            }, {})
                        ).map(([userName, userProjects]) => (
                            <ProjectCarousel
                                key={userName}
                                title={userName}
                                projects={userProjects}
                                theme={theme}
                                isPersonal={false}
                                onSelect={setSelectedProject}
                                selectedProjectId={selectedProject?.id}
                            />
                        ))
                    ) : (
                        // Regular list grid for personal view or sidebar
                        <div className={selectedProject ? 'space-y-3' : 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'}>
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    onClick={() => view === 'personal' && setSelectedProject(project)}
                                    className={`relative p-4 transition-all duration-200
                                        ${view === 'personal' ? 'cursor-pointer' : 'cursor-default'}
                                        ${selectedProject?.id === project.id
                                            ? `border-l-4 pl-4 ${theme === 'cyberpunk' ? 'bg-cyber-dark/50 border-cyber-primary' : 'bg-paper-highlight/20 border-paper-red'}`
                                            : `${view === 'personal' ? 'hover:pl-5 hover:opacity-80' : ''} ${theme === 'cyberpunk' ? 'hover:bg-cyber-dark/30' : 'hover:bg-black/5'}`
                                        }
                                        ${!selectedProject && (theme === 'paper' ? 'sketchy-border border-2 border-paper-ink h-32 flex flex-col justify-between' : 'border border-cyber-secondary h-32 flex flex-col justify-between bg-cyber-black')}
                                    `}
                                >

                                    <div className="flex justify-between items-start">
                                        <h3 className={`font-bold truncate ${selectedProject ? 'text-sm' : 'text-xl'}`}>
                                            {project.name}
                                        </h3>
                                        <div className="flex flex-col items-end">
                                            {!selectedProject && view === 'community' && (
                                                <span className={`text-[10px] opacity-60 mb-1 uppercase tracking-tighter ${theme === 'cyberpunk' ? 'text-cyber-secondary' : 'text-paper-ink'}`}>
                                                    BY: {project.display_name || project.user_name}
                                                </span>
                                            )}
                                            {!selectedProject && (
                                                <span className={`text-xs px-2 py-1 rounded ${theme === 'cyberpunk' ? 'bg-cyber-dark text-cyber-primary' : 'bg-paper-ink text-white'}`}>
                                                    {project.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-2">
                                        <ProgressBar progress={project.progress} />
                                    </div>
                                </div>
                            ))}

                            {/* "New Project" Card (Only in Personal & Grid View) */}
                            {view === 'personal' && !selectedProject && (
                                <div
                                    onClick={() => { setEditingProject(null); setIsProjectModalOpen(true); }}
                                    className={`flex items-center justify-center p-6 border-2 border-dashed opacity-60 hover:opacity-100 cursor-pointer transition-all h-32
                                    ${theme === 'cyberpunk' ? 'border-cyber-muted text-cyber-muted hover:border-cyber-primary hover:text-cyber-primary' : 'border-paper-line text-paper-line hover:border-paper-red hover:text-paper-red'}
                                `}>
                                    <div className="text-center">
                                        <span className="text-4xl block mb-2">+</span>
                                        <span className="font-bold">Nuevo Proyecto</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN: Detail View */}
            {selectedProject && (
                <div className={`
                    flex-1 flex flex-col min-w-0
                    animate-in fade-in slide-in-from-right-4 duration-300
                    ${theme === 'cyberpunk' ? 'bg-cyber-black/80' : 'bg-paper-bg'}
                `}>
                    {/* Detail Header */}
                    <div className={`p-8 pb-4 border-b ${theme === 'cyberpunk' ? 'border-cyber-muted/20' : 'border-paper-line/20'}`}>
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0 pr-4">
                                <div className="flex items-center gap-4 mb-2">
                                    <h1 className={`text-4xl font-bold truncate ${theme === 'cyberpunk' ? 'text-cyber-text' : 'text-paper-ink scribble-underline'}`}>
                                        {selectedProject.name}
                                    </h1>
                                    {view === 'personal' && (
                                        <div className="flex gap-2 shrink-0">
                                            <button
                                                onClick={() => { setEditingProject(selectedProject); setIsProjectModalOpen(true); }}
                                                className={`p-2 rounded-full hover:bg-black/5 flex items-center justify-center text-xl
                                                    ${theme === 'cyberpunk' ? 'text-cyber-muted hover:text-cyber-primary' : 'text-paper-ink/50 hover:text-paper-ink'}
                                                `}
                                                title="Editar proyecto"
                                            >
                                                ✎
                                            </button>
                                            <button
                                                onClick={() => triggerConfirm('project', selectedProject.id, '¿Eliminar proyecto?', `¿Estás seguro de que deseas eliminar "${selectedProject.name}"? Esta acción borrará todas sus tareas y no se puede deshacer.`)}
                                                className={`p-2 rounded-full hover:bg-black/5 flex items-center justify-center text-xl
                                                    ${theme === 'cyberpunk' ? 'text-cyber-muted hover:text-cyber-secondary' : 'text-paper-ink/50 hover:text-paper-red'}
                                                `}
                                                title="Eliminar proyecto"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p className="opacity-60 max-w-2xl break-words">{selectedProject.description}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => fetchTasks(selectedProject.id)} title="Refresh" className="opacity-50 hover:opacity-100">⟳</button>
                                <button onClick={() => setSelectedProject(null)} className="opacity-50 hover:opacity-100">✕ Close</button>
                            </div>
                        </div>
                    </div>

                    {/* Tasks Container */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="max-w-3xl mx-auto">
                            {loadingTasks ? (
                                <div className="text-center py-20 opacity-50 animate-pulse">Loading neural connection...</div>
                            ) : (
                                <div className="space-y-2">
                                    {tasks.map(task => (
                                        <TaskItem
                                            key={task.id}
                                            task={task}
                                            onUpdate={() => { fetchTasks(selectedProject.id, true); fetchProjects(true); }}
                                            onToggleTask={handleToggleTask}
                                            onToggleSubtask={handleToggleSubtask}
                                            onDeleteTask={(id) => triggerConfirm('task', id, '¿Eliminar tarea?', 'Esta acción borrará la tarea y todas sus subtareas.')}
                                            onDeleteSubtask={(id) => triggerConfirm('subtask', id, '¿Eliminar subtarea?', '¿Seguro que deseas eliminar esta subtarea?')}
                                        />
                                    ))}

                                    {tasks.length === 0 && (
                                        <div className="text-center py-20 opacity-40 border-2 border-dashed rounded-xl">
                                            <div className="text-4xl mb-4">📝</div>
                                            <p>No tasks yet. Create one to get started.</p>
                                        </div>
                                    )}

                                    {/* New Task Input at bottom */}
                                    {view === 'personal' && (
                                        <form onSubmit={handleCreateTask} className="mt-8 pt-4 opacity-80 hover:opacity-100 transition-opacity">
                                            <div className={`flex items-center gap-2 p-3 rounded-lg border-2 border-transparent focus-within:border-opacity-50
                                                ${theme === 'cyberpunk' ? 'focus-within:border-cyber-primary bg-cyber-dark/30' : 'focus-within:border-paper-ink bg-white/50 sketchy-input'}
                                            `}>
                                                <span className="text-xl pl-2 opacity-50">+</span>
                                                <input
                                                    type="text"
                                                    value={newTaskTitle}
                                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                                    placeholder="Add a new task..."
                                                    className="flex-1 bg-transparent outline-none p-1"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!newTaskTitle.trim()}
                                                    className={`px-4 py-1 font-bold text-sm uppercase rounded
                                                        ${theme === 'cyberpunk' ? 'bg-cyber-primary text-black' : 'bg-paper-ink text-white'}
                                                        disabled:opacity-0 disabled:translate-x-4 transition-all
                                                    `}
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectList;

