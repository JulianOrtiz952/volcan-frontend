import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import ProgressBar from './ProgressBar';
import { api } from '../services/api';

// --- Sub-components ---

const SubtaskItem = ({ subtask, onToggle, theme }) => (
    <div
        className="flex items-center text-sm opacity-80 pl-2 cursor-pointer hover:opacity-100 transition-opacity py-1"
        onClick={() => onToggle(subtask.id)}
    >
        <div className={`w-4 h-4 mr-2 border flex items-center justify-center transition-all flex-shrink-0
            ${subtask.completed ? 'bg-current' : 'transparent'}
            ${theme === 'cyberpunk' ? 'border-cyber-secondary text-cyber-secondary' : 'border-paper-ink text-paper-ink rounded-sm'}
        `}>
            {subtask.completed && '✓'}
        </div>
        <span className={`${subtask.completed ? 'line-through opacity-50' : ''} break-words`}>{subtask.title}</span>
    </div>
);

const TaskItem = ({ task, onUpdate, onToggleTask, onToggleSubtask }) => {
    const { theme } = useTheme();
    const [isAddingSubtask, setIsAddingSubtask] = useState(false);
    const [subtaskTitle, setSubtaskTitle] = useState('');

    const toggleComplete = async () => {
        onToggleTask(task.id, task.completed);
    };

    const toggleSubtask = async (subId) => {
        onToggleSubtask(task.id, subId, task.subtasks.find(s => s.id === subId).completed);
    };

    const deleteTask = async () => {
        if (!window.confirm("¿Eliminar esta tarea?")) return;
        try {
            await api.delete(`/tasks/${task.id}/`);
            onUpdate();
        } catch (e) {
            console.error("Failed to delete task", e);
        }
    };

    const deleteSubtask = async (subId) => {
        if (!window.confirm("¿Eliminar esta subtarea?")) return;
        try {
            await api.delete(`/subtasks/${subId}/`);
            onUpdate();
        } catch (e) {
            console.error("Failed to delete subtask", e);
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
                <div className="flex items-center flex-1">
                    <label className="flex items-center cursor-pointer select-none flex-1">
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={toggleComplete}
                            className={`mr-3 w-5 h-5 appearance-none border transition-all cursor-pointer flex-shrink-0
                              ${task.completed ? 'bg-current border-transparent' : 'bg-transparent'}
                              ${theme === 'cyberpunk' ? 'border-cyber-primary checked:bg-cyber-primary text-cyber-black' : 'border-paper-ink checked:bg-paper-red text-paper-bg rounded-md'}
                            `}
                        />
                        <span className={`font-bold text-lg ${task.completed ? 'line-through opacity-50' : ''}`}>
                            {task.title}
                        </span>
                    </label>
                    <button
                        onClick={deleteTask}
                        className={`ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1
                            ${theme === 'cyberpunk' ? 'text-cyber-secondary hover:text-white' : 'text-paper-ink hover:text-paper-red'}
                        `}
                        title="Eliminar tarea"
                    >
                        ✕
                    </button>
                </div>
                <div className={`text-xs font-mono px-2 py-1 rounded ml-2
                    ${theme === 'cyberpunk' ? 'bg-cyber-dark text-cyber-accent' : 'bg-paper-mark text-paper-ink'}
                `}>
                    {Math.round(task.progress)}%
                </div>
            </div>

            <div className="pl-8 w-full">
                <ProgressBar progress={task.progress} />

                {task.subtasks && task.subtasks.length > 0 && (
                    <div className="mt-4 space-y-2 border-l-2 pl-4 py-2" style={{ borderColor: theme === 'cyberpunk' ? 'rgba(0,204,255,0.2)' : 'rgba(0,0,0,0.1)' }}>
                        {task.subtasks.map(sub => (
                            <div key={sub.id} className="flex items-center justify-between group/sub">
                                <div
                                    className="flex items-center text-sm opacity-80 cursor-pointer hover:opacity-100 transition-opacity py-1 flex-1"
                                    onClick={() => toggleSubtask(sub.id)}
                                >
                                    <div className={`w-4 h-4 mr-2 border flex items-center justify-center transition-all flex-shrink-0
                                        ${sub.completed ? 'bg-current' : 'transparent'}
                                        ${theme === 'cyberpunk' ? 'border-cyber-secondary text-cyber-secondary' : 'border-paper-ink text-paper-ink rounded-sm'}
                                    `}>
                                        {sub.completed && '✓'}
                                    </div>
                                    <span className={`${sub.completed ? 'line-through opacity-50' : ''} break-words`}>{sub.title}</span>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteSubtask(sub.id); }}
                                    className={`opacity-0 group-hover/sub:opacity-100 transition-opacity p-1
                                        ${theme === 'cyberpunk' ? 'text-cyber-secondary hover:text-white' : 'text-paper-ink hover:text-paper-red'}
                                    `}
                                    title="Eliminar subtarea"
                                >
                                    ✕
                                </button>
                            </div>
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

// --- Create Project Modal ---

const CreateProjectModal = ({ onClose, onCreate, theme }) => {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onCreate(name, desc);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`relative w-full max-w-md p-8 shadow-2xl transition-all scale-100
                ${theme === 'cyberpunk' ? 'bg-cyber-dark border-2 border-cyber-primary' : 'bg-paper-bg border-4 border-paper-ink rotate-1'}
             `}>
                <h2 className={`text-2xl font-bold mb-6 text-center uppercase tracking-widest
                    ${theme === 'cyberpunk' ? 'text-cyber-primary' : 'text-paper-ink scribble-underline'}
                `}>New Project</h2>

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
                            Create
                        </button>
                    </div>
                </form>
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
    const [isCreating, setIsCreating] = useState(false);

    // New Inputs
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const fetchProjects = async (silent = false) => {
        try {
            const endpoint = view === 'community' ? '/projects/community/' : '/projects/';
            const data = await api.get(endpoint);
            setProjects(data);
        } catch (err) { console.error(err); }
    };

    const fetchTasks = async (projectId, silent = false) => {
        if (!silent) setLoadingTasks(true);
        try {
            const data = await api.get(`/tasks/?project=${projectId}`);
            setTasks(data);
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
    }, [selectedProject]);

    const handleToggleTask = async (taskId, currentStatus) => {
        // Optimistic update
        const previousTasks = [...tasks];
        setTasks(tasks.map(t =>
            t.id === taskId ? { ...t, completed: !currentStatus, progress: !currentStatus ? 100 : 0 } : t
        ));

        try {
            await api.patch(`/tasks/${taskId}/`, { completed: !currentStatus });
            // Refresh silently to sync with backend recalculated values
            await fetchTasks(selectedProject.id, true);
            fetchProjects(true);
        } catch (e) {
            console.error(e);
            setTasks(previousTasks); // Rollback
        }
    };

    const handleToggleSubtask = async (taskId, subId, currentStatus) => {
        // Optimistic update
        const previousTasks = [...tasks];
        setTasks(tasks.map(t => {
            if (t.id === taskId) {
                const newSubtasks = t.subtasks.map(s =>
                    s.id === subId ? { ...s, completed: !currentStatus } : s
                );
                // Simple local progress calc
                const completedCount = newSubtasks.filter(s => s.completed).length;
                const newProgress = (completedCount / newSubtasks.length) * 100;
                return { ...t, subtasks: newSubtasks, progress: newProgress };
            }
            return t;
        }));

        try {
            await api.patch(`/subtasks/${subId}/`, { completed: !currentStatus });
            await fetchTasks(selectedProject.id, true);
            fetchProjects(true);
        } catch (e) {
            console.error(e);
            setTasks(previousTasks); // Rollback
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
            await fetchTasks(selectedProject.id, true); // Refresh tasks silently
            fetchProjects(true); // Refresh project progress silently
        } catch (e) { console.error(e); }
    };

    const handleCreateProject = async (name, desc) => {
        try {
            await api.post('/projects/', { name, description: desc });
            fetchProjects();
            setIsCreating(false);
        } catch (e) { console.error(e); }
    };

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden relative">

            {isCreating && (
                <CreateProjectModal
                    onClose={() => setIsCreating(false)}
                    onCreate={handleCreateProject}
                    theme={theme}
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
                        <button onClick={() => setIsCreating(true)} className="text-2xl hover:scale-110 transition-transform">+</button>
                    )}
                </div>

                <div className={`overflow-y-auto px-4 pb-10 space-y-3 ${selectedProject ? '' : 'grid md:grid-cols-2 lg:grid-cols-3 gap-6 space-y-0 px-8'}`}>
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => setSelectedProject(project)}
                            className={`relative p-4 cursor-pointer group transition-all duration-200
                                ${selectedProject?.id === project.id
                                    ? `border-l-4 pl-4 ${theme === 'cyberpunk' ? 'bg-cyber-dark/50 border-cyber-primary' : 'bg-paper-highlight/20 border-paper-red'}`
                                    : `hover:pl-5 hover:opacity-80 ${theme === 'cyberpunk' ? 'hover:bg-cyber-dark/30' : 'hover:bg-black/5'}`
                                }
                                ${!selectedProject && (theme === 'paper' ? 'sketchy-border border-2 border-paper-ink h-32 flex flex-col justify-between' : 'border border-cyber-secondary h-32 flex flex-col justify-between bg-cyber-black')}
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <h3 className={`font-bold truncate ${selectedProject ? 'text-sm' : 'text-xl'}`}>
                                    {project.name}
                                </h3>
                                {!selectedProject && (
                                    <span className={`text-xs px-2 py-1 rounded ${theme === 'cyberpunk' ? 'bg-cyber-dark text-cyber-primary' : 'bg-paper-ink text-white'}`}>
                                        {project.status}
                                    </span>
                                )}
                            </div>

                            <div className="mt-2">
                                <ProgressBar progress={project.progress} />
                            </div>
                        </div>
                    ))}

                    {/* "New Project" Card (Only in Personal & Grid View) */}
                    {view === 'personal' && !selectedProject && (
                        <div
                            onClick={() => setIsCreating(true)}
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
                            <div>
                                <h1 className={`text-4xl font-bold mb-2 ${theme === 'cyberpunk' ? 'text-cyber-text' : 'text-paper-ink scribble-underline'}`}>
                                    {selectedProject.name}
                                </h1>
                                <p className="opacity-60 max-w-2xl">{selectedProject.description}</p>
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
                                        />
                                    ))}

                                    {tasks.length === 0 && (
                                        <div className="text-center py-20 opacity-40 border-2 border-dashed rounded-xl">
                                            <div className="text-4xl mb-4">📝</div>
                                            <p>No tasks yet. Create one to get started.</p>
                                        </div>
                                    )}

                                    {/* New Task Input at bottom */}
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
