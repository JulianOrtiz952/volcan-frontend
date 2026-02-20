import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ProgressBar = ({ progress }) => {
    const { theme } = useTheme();
    const pct = Math.min(Math.max(Math.round(progress || 0), 0), 100);

    // Color by percentage
    const getColor = () => {
        switch (theme) {
            case 'cyberpunk':
                if (pct < 25) return { bar: 'bg-red-500', glow: '0 0 10px rgba(239,68,68,0.8)' };
                if (pct < 50) return { bar: 'bg-orange-500', glow: '0 0 10px rgba(249,115,22,0.8)' };
                if (pct < 75) return { bar: 'bg-yellow-400', glow: '0 0 10px rgba(250,204,21,0.8)' };
                return { bar: 'bg-cyber-accent', glow: '0 0 12px #ccff00' };

            case 'dark':
                if (pct < 25) return { bar: 'bg-red-500' };
                if (pct < 50) return { bar: 'bg-orange-500' };
                if (pct < 75) return { bar: 'bg-dark-accent' };
                return { bar: 'bg-dark-success' };

            case 'sakura':
                if (pct < 25) return { bar: 'bg-red-400' };
                if (pct < 50) return { bar: 'bg-sakura-gold' };
                if (pct < 75) return { bar: 'bg-sakura-blossom' };
                return { bar: 'bg-sakura-green' };

            default: // paper
                if (pct < 25) return { bar: 'bg-red-500' };
                if (pct < 50) return { bar: 'bg-orange-500' };
                if (pct < 75) return { bar: 'bg-yellow-400' };
                return { bar: 'bg-green-500' };
        }
    };

    const color = getColor();

    // Container style by theme
    const containerCls = {
        cyberpunk: 'bg-cyber-dark border border-cyber-muted/40 h-5',
        paper: 'bg-white border-2 border-paper-ink sketchy-box h-5',
        dark: 'bg-dark-elevated border border-dark-border rounded-full h-2',
        sakura: 'bg-sakura-petal/50 border border-sakura-blossom/30 rounded-full h-2',
    }[theme] || 'bg-gray-200 h-3 rounded-full';

    // Bar style
    const barCls = {
        cyberpunk: '',
        paper: '',
        dark: 'rounded-full',
        sakura: 'rounded-full',
    }[theme] || 'rounded-full';

    // Whether to show text inside the bar
    const showLabel = theme === 'cyberpunk' || theme === 'paper';

    return (
        <div className={`w-full relative overflow-hidden transition-all ${containerCls}`}>
            {/* Percentage label (inside bar, for thick themes) */}
            {showLabel && (
                <div className={`absolute inset-0 flex items-center justify-end px-2 z-10 font-bold text-xs
                    ${theme === 'cyberpunk' ? 'text-white drop-shadow' : 'text-paper-ink'}`}>
                    {pct}%
                </div>
            )}

            {/* Bar fill */}
            <div
                className={`h-full transition-all duration-700 ease-out ${color.bar} ${barCls}`}
                style={{
                    width: `${pct}%`,
                    boxShadow: color.glow || 'none',
                }}
            />

            {/* Cyberpunk pulse edge */}
            {theme === 'cyberpunk' && pct > 0 && pct < 100 && (
                <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white/60 animate-pulse"
                    style={{ left: `${pct}%` }}
                />
            )}

            {/* Sakura animated shimmer */}
            {theme === 'sakura' && pct > 0 && (
                <div
                    className="absolute top-0 bottom-0 w-8 opacity-40"
                    style={{
                        left: `${pct - 10}%`,
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                        animation: 'shimmer 2s ease-in-out infinite',
                    }}
                />
            )}
        </div>
    );
};

export default ProgressBar;
