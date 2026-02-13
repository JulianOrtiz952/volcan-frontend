import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    const { theme } = useTheme();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`relative w-full max-w-sm p-6 shadow-2xl transition-all scale-100
                ${theme === 'cyberpunk' ? 'bg-cyber-dark border-2 border-cyber-secondary' : 'bg-paper-bg border-4 border-paper-ink -rotate-1'}
             `}>
                <h3 className={`text-xl font-bold mb-3 uppercase tracking-wider
                    ${theme === 'cyberpunk' ? 'text-cyber-secondary' : 'text-paper-ink'}
                `}>
                    {title || '¿Estás seguro?'}
                </h3>

                <p className={`mb-6 text-sm opacity-90
                    ${theme === 'cyberpunk' ? 'text-white' : 'text-paper-ink'}
                `}>
                    {message || 'Esta acción no se puede deshacer.'}
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={onCancel}
                        className={`flex-1 py-2 font-bold uppercase tracking-wider hover:opacity-80 transition-opacity
                            ${theme === 'cyberpunk' ? 'bg-cyber-muted/20 text-white' : 'bg-gray-200 text-gray-700'}
                        `}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-2 font-bold uppercase tracking-wider hover:scale-[1.02] transition-transform
                            ${theme === 'cyberpunk' ? 'bg-cyber-secondary text-black' : 'bg-paper-red text-white sketchy-box'}
                        `}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
