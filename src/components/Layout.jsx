import React from 'react';
import Navbar from './Navbar';
import TimerOverlay from './TimerOverlay';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children, currentView, setView }) => {
    const { theme } = useTheme();

    return (
        <div className={`flex flex-col min-h-screen relative overflow-hidden
      ${theme === 'cyberpunk' ? 'bg-cyber-black bg-cyber-grid bg-[length:40px_40px]' : 'bg-paper-bg'}
    `}>
            <Navbar currentView={currentView} setView={setView} />
            <TimerOverlay currentView={currentView} setView={setView} />

            <main className="flex-1 overflow-y-auto z-10">
                <div className="w-full h-full">
                    {children}
                </div>
            </main>

            {/* Footer or persistent elements could go here */}
        </div>
    );
};

export default Layout;
