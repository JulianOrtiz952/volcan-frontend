import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

const WeeklyHistogram = ({ stats = [] }) => {
    const { theme } = useTheme();

    const last7Days = useMemo(() => {
        const today = new Date();
        const days = [];
        const dataMap = {};
        stats.forEach(s => dataMap[s.date] = s.total_minutes);

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
            days.push({
                name: dayName,
                date: dateStr,
                hours: (dataMap[dateStr] || 0) / 60
            });
        }
        return days;
    }, [stats]);

    const maxHours = useMemo(() => {
        const peak = Math.max(...last7Days.map(d => d.hours), 1); // min 1 to avoid /0
        return Math.ceil(peak);
    }, [last7Days]);

    return (
        <div className="w-full h-64 flex gap-4">
            {/* Y-Axis Labels */}
            <div className="flex flex-col justify-between py-2 text-[8px] font-black opacity-30 text-right w-8">
                <span>{maxHours}H</span>
                <span>{maxHours / 2}H</span>
                <span>0H</span>
            </div>

            <div className="flex-1 flex flex-col pt-2">
                <div className="flex-1 flex items-end gap-2 sm:gap-4 px-2 relative border-b border-white/10 pb-2">
                    {/* Horizontal Guide Lines */}
                    <div className="absolute inset-x-0 top-0 border-t border-white/5 w-full pointer-events-none h-px" />
                    <div className="absolute inset-x-0 top-1/2 border-t border-white/5 w-full pointer-events-none h-px" />

                    {last7Days.map(day => (
                        <div key={day.date} className="flex-1 flex flex-col items-center group relative z-10 h-full justify-end">
                            {/* Tooltip */}
                            <div className={`
                                absolute bottom-full mb-2 hidden group-hover:block z-50
                                px-2 py-1 text-[10px] whitespace-nowrap font-bold rounded shadow-xl
                                ${theme === 'cyberpunk' ? 'bg-cyber-accent text-black' : 'bg-paper-ink text-white'}
                            `}>
                                {day.hours < 1 ? `${Math.round(day.hours * 60)}m` : `${day.hours.toFixed(1)}h`}
                            </div>

                            {/* Bar */}
                            <div
                                style={{ height: `${(day.hours / maxHours) * 100}%` }}
                                className={`
                                    w-full rounded-t-sm transition-all duration-700 min-h-[4px]
                                    ${theme === 'cyberpunk'
                                        ? 'bg-gradient-to-t from-cyber-secondary/50 to-cyber-primary shadow-[0_0_15px_rgba(255,0,85,0.2)] hover:shadow-[0_0_20px_rgba(255,0,85,0.5)]'
                                        : 'bg-paper-ink/80 hover:bg-paper-ink sketchy-box'}
                                `}
                            />
                        </div>
                    ))}
                </div>

                {/* X-Axis Labels */}
                <div className="flex gap-2 sm:gap-4 px-2 mt-3">
                    {last7Days.map(day => (
                        <div key={day.date} className="flex-1 text-center text-[10px] font-black opacity-40">
                            {day.name}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WeeklyHistogram;
