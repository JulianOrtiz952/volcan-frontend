import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import ProgressBar from './ProgressBar';
import { api } from '../services/api';

const TaskItem = ({ task, onUpdate }) => {
    const { theme } = useTheme();
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;

    const toggleComplete = async () => {
        // Toggle logic
        try {
            const newStatus = !task.completed;
            // Optimistic update handled by parent refetch or local state?
            // For simplicity, we trigger parent update
            await api.patch(`/tasks/${task.id}/`, { completed: newStatus });
            onUpdate();
        } catch (e) {
            console.error("Failed to update task", e);
        }
    };

    return (
        <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
                <label className="flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={toggleComplete}
                        className={`mr-2 w-5 h-5 appearance-none border transition-all
              ${task.completed ? 'bg-current border-transparent' : 'bg-transparent'}
              ${theme === 'cyberpunk' ? 'border-cyber-primary checked:bg-cyber-primary text-cyber-black' : 'border-paper-ink checked:bg-paper-red text-paper-bg rounded-md'}
            `}
                    />
                    <span className={`font-bold ${task.completed ? 'line-through opacity-50' : ''}`}>
                        {task.title}
                    </span>
                    {task.progress === 100 && (
                        <span className="ml-2 text-xs text-green-500">
                            (100%)
                        </span>
                    )}
                </label>
            </div>

            {hasSubtasks && (
                <div className="pl-6 border-l-2 border-opacity-30 ml-2" style={{ borderColor: theme === 'cyberpunk' ? '#00ccff' : '#a4b0be' }}>
                    <ProgressBar progress={task.progress} />
                    <div className="mt-2 space-y-2">
                        {task.subtasks.map(sub => (
                            <div key={sub.id} className="flex items-center text-sm opacity-80">
                                <div className={`w-3 h-3 mr-2 border
                    ${sub.completed ? 'bg-current' : 'transparent'}
                    ${theme === 'cyberpunk' ? 'border-cyber-secondary text-cyber-secondary' : 'border-paper-ink text-paper-ink'}
                 `}></div>
                                {sub.title}
                            </div>
                        ))}
                        {/* Subtask adding placeholder */}
                    </div>
                </div>
            )}
        </div>
    );
};

const TaskModal = ({ project, onClose }) => {
    const { theme } = useTheme();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        try {
            const data = await api.get(`/tasks/?project=${project.id}`);
            setTasks(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [project.id]);

    if (!project) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={`relative w-full max-w-md p-6 shadow-2xl transition-all
         ${theme === 'cyberpunk' ? 'bg-cyber-dark border-2 border-cyber-muted' : 'bg-paper-bg border-4 border-paper-ink rotate-1'}
      `}>
                {/* Header */}
                <div className={`flex justify-between items-center mb-6 pb-2 border-b
           ${theme === 'cyberpunk' ? 'border-cyber-primary text-cyber-text' : 'border-paper-ink text-paper-ink'}
        `}>
                    <h2 className="text-xl font-bold uppercase tracking-widest">TAREAS</h2>
                    <button onClick={onClose} className="hover:scale-125 transition-transform">
                        ➜
                    </button>
                </div>

                {/* List */}
                <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {loading ? <p>Loading...</p> : tasks.map(t => (
                        <TaskItem key={t.id} task={t} onUpdate={fetchTasks} />
                    ))}
                    {tasks.length === 0 && !loading && (
                        <p className="opacity-50 text-center text-sm">No tasks yet.</p>
                    )}
                </div>

                {/* Footer */}
                <div className={`mt-6 pt-4 border-t flex justify-between items-center
           ${theme === 'cyberpunk' ? 'border-cyber-muted' : 'border-paper-line'}
        `}>
                    <span className="text-xs opacity-70">{project.name}</span>
                    <button className={`px-4 py-1 text-sm font-bold skew-x-[-10deg]
              ${theme === 'cyberpunk' ? 'bg-cyber-primary text-black hover:bg-white' : 'bg-paper-ink text-white hover:bg-paper-red'}
           `}>
                        GUARDAR
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskModal;
