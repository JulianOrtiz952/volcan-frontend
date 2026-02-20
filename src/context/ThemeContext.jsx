import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
    cyberpunk: {
        id: 'cyberpunk',
        label: 'CYBERPUNK',
        description: 'Neon y oscuridad',
        preview: { bg: '#0a0a0f', accent: '#ff0055', text: '#00ccff' },
    },
    paper: {
        id: 'paper',
        label: 'PAPER NOTES',
        description: 'Cuaderno dibujado a mano',
        preview: { bg: '#fdfbf7', accent: '#ff4444', text: '#2b2b2b' },
    },
    dark: {
        id: 'dark',
        label: 'DARK MODE',
        description: 'Limpio y minimalista oscuro',
        preview: { bg: '#0d0d0d', accent: '#7c6dfa', text: '#ededed' },
    },
    sakura: {
        id: 'sakura',
        label: 'SAKURA',
        description: 'Floración de cerezo japonés',
        preview: { bg: '#fff5f7', accent: '#e8577a', text: '#3d1a24' },
    },
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('app-theme') || 'cyberpunk';
    });

    useEffect(() => {
        localStorage.setItem('app-theme', theme);
        const root = window.document.documentElement;

        // Remove all theme classes
        root.classList.remove('theme-cyberpunk', 'theme-paper', 'theme-dark', 'theme-sakura', 'dark');
        root.classList.add(`theme-${theme}`);

        // Dark variants
        if (theme === 'cyberpunk' || theme === 'dark') {
            root.classList.add('dark');
        }
    }, [theme]);

    // Body class per theme for global backgrounds
    const bodyClass = {
        cyberpunk: 'bg-cyber-black text-cyber-text font-cyber selection:bg-cyber-primary selection:text-white',
        paper: 'bg-paper-bg text-paper-ink font-paper bg-paper-lines selection:bg-paper-highlight',
        dark: 'bg-dark-bg text-dark-text font-dark selection:bg-dark-primary/30 selection:text-dark-text',
        sakura: 'bg-sakura-bg text-sakura-ink font-sakura selection:bg-sakura-blossom/40 selection:text-sakura-ink',
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <div className={`min-h-screen transition-all duration-500 ease-in-out ${bodyClass[theme] || bodyClass.cyberpunk}`}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
