import React from 'react';

const t4 = (theme, map) => map[theme] || map.cyberpunk;

export default function FormattedContent({ content, theme }) {
    if (!content) return null;

    // Theme-aware divider tokens
    const dividerClasses = t4(theme, {
        cyberpunk: 'border-cyber-primary/40 border-dashed',
        paper: 'border-neutral-300',
        dark: 'border-dark-border',
        sakura: 'border-sakura-blossom/60'
    });

    const highlightClasses = t4(theme, {
        cyberpunk: 'text-cyber-primary font-bold drop-shadow-[0_0_2px_rgba(255,0,85,0.4)]',
        paper: 'text-neutral-900 font-bold',
        dark: 'text-dark-text font-bold',
        sakura: 'text-sakura-deep font-bold'
    });

    return (
        <div className="space-y-0.5">
            {content.split('\n').map((line, i) => {
                if (line.trim() === '---') {
                    return <hr key={i} className={`my-6 border-t-2 ${dividerClasses}`} />;
                }
                const parts = line.split(/(\*(?:[^*]+)\*)/g);
                return (
                    <div key={i} className="min-h-[1.5rem] whitespace-pre-wrap">
                        {parts.map((part, j) => {
                            if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
                                return <strong key={j} className={highlightClasses}>{part.slice(1, -1)}</strong>;
                            }
                            return <span key={j}>{part}</span>;
                        })}
                    </div>
                );
            })}
        </div>
    );
}
