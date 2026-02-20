import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

const WeeklyHistogram = ({ stats = [] }) => {
    const { theme } = useTheme();

    const last7Days = useMemo(() => {
        const today = new Date();
        const dataMap = {};
        stats.forEach(s => dataMap[s.date] = s.total_minutes);

        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(today.getDate() - (6 - i));
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
            return { name: dayName, date: dateStr, hours: (dataMap[dateStr] || 0) / 60 };
        });
    }, [stats]);

    const maxHours = useMemo(() =>
        Math.ceil(Math.max(...last7Days.map(d => d.hours), 1)), [last7Days]);

    // Per-theme tokens
    const barStyle = {
        cyberpunk: { background: 'linear-gradient(to top, rgba(0,204,255,0.3), #ff0055)', boxShadow: '0 0 12px rgba(255,0,85,0.25)' },
        paper: { background: '#1a1a1a' },
        dark: { background: 'linear-gradient(to top, rgba(124,109,250,0.3), #7c6dfa)', boxShadow: '0 0 10px rgba(124,109,250,0.2)' },
        sakura: { background: 'linear-gradient(to top, rgba(232,87,122,0.25), #e8577a)', boxShadow: '0 0 10px rgba(232,87,122,0.2)' },
    }[theme] || {};

    const tooltipStyle = {
        cyberpunk: { background: '#00ccff', color: '#000' },
        paper: { background: '#1a1a1a', color: '#fff' },
        dark: { background: '#7c6dfa', color: '#fff' },
        sakura: { background: '#e8577a', color: '#fff' },
    }[theme] || { background: '#7c6dfa', color: '#fff' };

    const guideColor = {
        cyberpunk: 'rgba(255,255,255,0.05)',
        paper: 'rgba(0,0,0,0.06)',
        dark: 'rgba(255,255,255,0.05)',
        sakura: 'rgba(232,87,122,0.08)',
    }[theme] || 'rgba(255,255,255,0.05)';

    const axisColor = {
        cyberpunk: 'rgba(255,255,255,0.15)',
        paper: 'rgba(0,0,0,0.12)',
        dark: 'rgba(255,255,255,0.12)',
        sakura: 'rgba(232,87,122,0.2)',
    }[theme] || 'rgba(255,255,255,0.12)';

    const labelStyle = {
        cyberpunk: { color: 'rgba(204,255,0,0.35)' },
        paper: { color: 'rgba(26,26,26,0.35)' },
        dark: { color: 'rgba(255,255,255,0.3)' },
        sakura: { color: 'rgba(100,50,70,0.4)' },
    }[theme] || {};

    return (
        <div className="w-full h-64 flex gap-4">
            {/* Y-Axis */}
            <div className="flex flex-col justify-between py-2 text-[8px] font-black text-right w-8" style={labelStyle}>
                <span>{maxHours}H</span>
                <span>{maxHours / 2}H</span>
                <span>0H</span>
            </div>

            <div className="flex-1 flex flex-col pt-2">
                <div className="flex-1 flex items-end gap-2 sm:gap-4 px-2 relative pb-2"
                    style={{ borderBottom: `1px solid ${axisColor}` }}>

                    {/* Guide lines */}
                    <div className="absolute inset-x-0 top-0 w-full pointer-events-none h-px"
                        style={{ borderTop: `1px solid ${guideColor}` }} />
                    <div className="absolute inset-x-0 top-1/2 w-full pointer-events-none h-px"
                        style={{ borderTop: `1px solid ${guideColor}` }} />

                    {last7Days.map(day => (
                        <div key={day.date} className="flex-1 flex flex-col items-center group relative z-10 h-full justify-end">
                            {/* Tooltip */}
                            <div
                                className="absolute bottom-full mb-2 hidden group-hover:block z-50 px-2 py-1 text-[10px] whitespace-nowrap font-bold rounded shadow-xl pointer-events-none"
                                style={tooltipStyle}
                            >
                                {day.hours < 1 ? `${Math.round(day.hours * 60)}m` : `${day.hours.toFixed(1)}h`}
                            </div>

                            {/* Bar */}
                            <div
                                style={{
                                    height: `${(day.hours / maxHours) * 100}%`,
                                    minHeight: '4px',
                                    ...barStyle,
                                }}
                                className="w-full rounded-t-sm transition-all duration-700"
                            />
                        </div>
                    ))}
                </div>

                {/* X-Axis */}
                <div className="flex gap-2 sm:gap-4 px-2 mt-3">
                    {last7Days.map(day => (
                        <div key={day.date} className="flex-1 text-center text-[10px] font-black" style={labelStyle}>
                            {day.name}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WeeklyHistogram;
