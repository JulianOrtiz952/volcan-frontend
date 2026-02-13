import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Initialize theme from localStorage or default to 'cyberpunk'
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('app-theme') || 'cyberpunk';
    });

    useEffect(() => {
        // Persist theme to localStorage
        localStorage.setItem('app-theme', theme);

        // Apply theme-specific attributes to body or root
        const root = window.document.documentElement;
        root.classList.remove('theme-cyberpunk', 'theme-paper');
        root.classList.add(`theme-${theme}`);

        // Also toggle a 'dark' class if cyberpunk is dark mode compatible
        if (theme === 'cyberpunk') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'cyberpunk' ? 'paper' : 'cyberpunk');
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            <div className={`min-h-screen transition-all duration-500 ease-in-out
        ${theme === 'cyberpunk' ? 'bg-cyber-black text-cyber-text font-cyber selection:bg-cyber-primary selection:text-white' : ''}
        ${theme === 'paper' ? 'bg-paper-bg text-paper-ink font-paper bg-paper-lines selection:bg-paper-highlight' : ''}
      `}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
