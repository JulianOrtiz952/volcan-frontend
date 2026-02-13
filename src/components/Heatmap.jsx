import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

const Heatmap = ({ stats = [] }) => {
    const { theme } = useTheme();

    const dataMap = useMemo(() => {
        const map = {};
        stats.forEach(item => {
            map[item.date] = item.total_minutes || 0;
        });
        return map;
    }, [stats]);

    const weeks = useMemo(() => {
        const today = new Date();
        const dates = [];
        // We want 53 weeks to show a full year
        // Start from 370 days ago to ensure we cover the full weeks
        for (let i = 370; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            dates.push(d);
        }

        // Filter last year and align to Sundays (or just show last 365 days in a grid)
        // Group by week (Sunday to Saturday)
        const weekGrid = [];
        let currentWeek = [];

        // Find the first Sunday in our range to start the grid properly
        let startIdx = 0;
        while (dates[startIdx].getDay() !== 0) startIdx++;

        for (let i = startIdx; i < dates.length; i++) {
            const d = dates[i];
            const dateStr = d.toISOString().split('T')[0];
            currentWeek.push({
                date: dateStr,
                minutes: dataMap[dateStr] || 0,
                dayOfWeek: d.getDay()
            });

            if (d.getDay() === 6) {
                weekGrid.push(currentWeek);
                currentWeek = [];
            }
        }
        if (currentWeek.length > 0) weekGrid.push(currentWeek);

        // Limit to last 53 weeks
        return weekGrid.slice(-53);
    }, [dataMap]);

    const getIntensity = (minutes) => {
        if (!minutes) return 0;
        const hours = minutes / 60;
        if (hours < 1) return 1;
        if (hours < 2) return 2;
        if (hours < 3) return 3;
        if (hours < 4) return 4;
        if (hours < 5) return 5;
        return 6;
    };

    const colors = {
        cyberpunk: [
            'bg-cyber-dark',      // 0
            'bg-[#3a0b1f]',       // 1
            'bg-[#671437]',       // 2
            'bg-[#931c4f]',       // 3
            'bg-[#bf2467]',       // 4
            'bg-[#eb2d80]',       // 5 (Almost cyber-primary)
            'bg-cyber-primary'    // 6+
        ],
        paper: [
            'bg-gray-100',        // 0
            'bg-blue-100',        // 1
            'bg-blue-200',        // 2
            'bg-blue-300',        // 3
            'bg-blue-400',        // 4
            'bg-blue-500',        // 5
            'bg-paper-ink'        // 6+
        ]
    };

    const currentColors = theme === 'cyberpunk' ? colors.cyberpunk : colors.paper;

    return (
        <div className="w-full overflow-x-auto custom-scrollbar pb-4">
            <div className="flex gap-1 min-w-max">
                {weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1">
                        {week.map((day, dIdx) => (
                            <div
                                key={day.date}
                                className={`w-3 h-3 rounded-sm transition-all duration-300 hover:scale-150 relative group
                                    ${currentColors[getIntensity(day.minutes)]}
                                    ${theme === 'paper' ? 'sketchy-border' : ''}
                                    hover:z-50
                                `}
                            >
                                <div className={`
                                    absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block
                                    px-2 py-1 text-[10px] whitespace-nowrap font-bold rounded pointer-events-none shadow-xl
                                    ${theme === 'cyberpunk' ? 'bg-cyber-primary text-black' : 'bg-paper-ink text-white'}
                                `}>
                                    {day.date}: {Math.round(day.minutes)} min
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-bold opacity-50 uppercase tracking-widest px-1">
                <span>Last 365 Days</span>
                <div className="flex items-center gap-1">
                    <span>Less</span>
                    {currentColors.map((c, i) => (
                        <div key={i} className={`w-2 h-2 ${c} rounded-sm`}></div>
                    ))}
                    <span>More</span>
                </div>
            </div>
        </div>
    );
};

export default Heatmap;
