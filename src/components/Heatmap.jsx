import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

const Heatmap = ({ stats = [] }) => {
    const { theme } = useTheme();

    const dataMap = useMemo(() => {
        const map = {};
        stats.forEach(item => { map[item.date] = item.total_minutes || 0; });
        return map;
    }, [stats]);

    const weeks = useMemo(() => {
        const today = new Date();
        const dates = [];
        for (let i = 370; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            dates.push(d);
        }

        const weekGrid = [];
        let currentWeek = [];
        let startIdx = 0;
        while (dates[startIdx].getDay() !== 0) startIdx++;

        for (let i = startIdx; i < dates.length; i++) {
            const d = dates[i];
            const dateStr = d.toISOString().split('T')[0];
            currentWeek.push({ date: dateStr, minutes: dataMap[dateStr] || 0, dayOfWeek: d.getDay() });
            if (d.getDay() === 6) { weekGrid.push(currentWeek); currentWeek = []; }
        }
        if (currentWeek.length > 0) weekGrid.push(currentWeek);
        return weekGrid.slice(-53);
    }, [dataMap]);

    const getIntensity = (minutes) => {
        if (!minutes) return 0;
        const h = minutes / 60;
        if (h < 1) return 1;
        if (h < 2) return 2;
        if (h < 3) return 3;
        if (h < 4) return 4;
        if (h < 5) return 5;
        return 6;
    };

    // Per-theme color scales — using inline style for dark/sakura to avoid missing Tailwind classes
    const getColor = (intensity) => {
        const scales = {
            cyberpunk: ['#0d0d0d', '#3a0b1f', '#671437', '#931c4f', '#bf2467', '#eb2d80', '#ff0055'],
            paper: ['#f0f0ee', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#1e3a8a'],
            dark: ['#0f0f12', '#1e1b3a', '#2e2860', '#3d3580', '#5048a0', '#6c62c8', '#7c6dfa'],
            sakura: ['#fdf2f5', '#fce7ec', '#f9c8d4', '#f5a7bc', '#ee829f', '#e5577a', '#e8577a'],
        };
        return (scales[theme] || scales.dark)[intensity];
    };

    const tooltipStyle = {
        cyberpunk: { background: '#ff0055', color: '#000' },
        paper: { background: '#1a1a1a', color: '#fff' },
        dark: { background: '#7c6dfa', color: '#fff' },
        sakura: { background: '#e8577a', color: '#fff' },
    }[theme] || { background: '#7c6dfa', color: '#fff' };

    const legendItems = [0, 1, 2, 3, 4, 5, 6];

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="flex gap-1 min-w-max">
                {weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1">
                        {week.map((day) => (
                            <div
                                key={day.date}
                                className="w-3 h-3 rounded-sm transition-all duration-300 hover:scale-150 relative group hover:z-50"
                                style={{ backgroundColor: getColor(getIntensity(day.minutes)) }}
                            >
                                <div
                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block px-2 py-1 text-[10px] whitespace-nowrap font-bold rounded pointer-events-none shadow-xl z-50"
                                    style={tooltipStyle}
                                >
                                    {day.date}: {Math.round(day.minutes)} min
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-bold uppercase tracking-widest px-1"
                style={{ color: 'currentColor', opacity: 0.45 }}>
                <span>Last 365 Days</span>
                <div className="flex items-center gap-1">
                    <span>Less</span>
                    {legendItems.map(i => (
                        <div key={i} className="w-2 h-2 rounded-sm" style={{ backgroundColor: getColor(i) }} />
                    ))}
                    <span>More</span>
                </div>
            </div>
        </div>
    );
};

export default Heatmap;
