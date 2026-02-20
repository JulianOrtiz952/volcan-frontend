import React, { useMemo } from 'react';
import Navbar from './Navbar';
import TimerOverlay from './TimerOverlay';
import { useTheme } from '../context/ThemeContext';

// Floating sakura petals (decorative)
const SakuraPetals = () => {
    const petals = useMemo(() =>
        Array.from({ length: 10 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 6}s`,
            duration: `${7 + Math.random() * 6}s`,
            size: `${10 + Math.random() * 8}px`,
        })), []
    );

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {petals.map(p => (
                <div key={p.id} className="absolute opacity-0"
                    style={{
                        left: p.left,
                        top: '-20px',
                        fontSize: p.size,
                        animation: `petal-drift ${p.duration} ${p.delay} ease-in-out infinite`,
                    }}>
                    🌸
                </div>
            ))}
        </div>
    );
};

const Layout = ({ children, currentView, setView, onCommunityJoined }) => {
    const { theme } = useTheme();

    const bgClass = {
        cyberpunk: 'bg-cyber-black bg-cyber-grid bg-[length:40px_40px]',
        paper: 'bg-paper-bg',
        dark: 'bg-dark-bg bg-dark-dots bg-[length:24px_24px]',
        sakura: 'bg-sakura-bg bg-sakura-petals',
    }[theme] || 'bg-cyber-black';

    return (
        <div className={`flex flex-col min-h-screen relative overflow-hidden ${bgClass} transition-colors duration-500`}>

            {/* Sakura ambient petals */}
            {theme === 'sakura' && <SakuraPetals />}

            {/* Dark mode subtle vignette */}
            {theme === 'dark' && (
                <div className="fixed inset-0 pointer-events-none z-0"
                    style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,109,250,0.04) 0%, transparent 60%)' }} />
            )}

            <Navbar currentView={currentView} setView={setView} onCommunityJoined={onCommunityJoined} />
            <TimerOverlay currentView={currentView} setView={setView} />

            <main className="flex-1 overflow-y-auto z-10 relative">
                <div className="w-full h-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
