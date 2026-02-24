import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    const { theme } = useTheme();

    if (!isOpen) return null;

    const t4 = (theme, map) => map[theme] || map.cyberpunk;

    const modalBg = t4(theme, {
        cyberpunk: 'bg-cyber-dark border-2 border-cyber-secondary shadow-[0_0_20px_rgba(0,255,255,0.2)]',
        paper: 'bg-paper-bg border-4 border-paper-ink -rotate-1 shadow-xl',
        dark: 'bg-dark-surface border border-dark-border rounded-2xl shadow-2xl',
        sakura: 'bg-white border border-sakura-blossom/50 rounded-2xl shadow-xl sakura-card',
    });

    const titleCls = t4(theme, {
        cyberpunk: 'text-cyber-secondary font-mono',
        paper: 'text-paper-ink font-bold scribble-underline',
        dark: 'text-dark-text font-bold',
        sakura: 'text-sakura-ink font-bold',
    });

    const bodyCls = t4(theme, {
        cyberpunk: 'text-white opacity-80',
        paper: 'text-paper-ink',
        dark: 'text-dark-subtle',
        sakura: 'text-sakura-subtle',
    });

    const btnCancel = t4(theme, {
        cyberpunk: 'bg-cyber-muted/20 text-white border border-cyber-muted/30',
        paper: 'bg-gray-200 text-gray-700',
        dark: 'bg-dark-elevated text-dark-muted border border-dark-border rounded-lg',
        sakura: 'bg-sakura-petal text-sakura-subtle rounded-xl',
    });

    const btnConfirm = t4(theme, {
        cyberpunk: 'bg-cyber-secondary text-black hover:bg-white',
        paper: 'bg-paper-red text-white sketchy-box',
        dark: 'bg-dark-primary text-white hover:bg-dark-primary/90 rounded-lg',
        sakura: 'bg-sakura-deep text-white hover:bg-sakura-deep/90 rounded-xl',
    });

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`relative w-full max-w-sm p-6 transition-all scale-100 ${modalBg}`}>
                <h3 className={`text-xl mb-3 uppercase tracking-wider ${titleCls}`}>
                    {title || '¿Estás seguro?'}
                </h3>

                <p className={`mb-6 text-sm ${bodyCls}`}>
                    {message || 'Esta acción no se puede deshacer.'}
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={onCancel}
                        className={`flex-1 py-2 font-bold uppercase tracking-wider hover:opacity-80 transition-opacity ${btnCancel}`}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-2 font-bold uppercase tracking-wider hover:scale-[1.02] transition-transform ${btnConfirm}`}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
