/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Manual toggling via class 'dark' (or data-theme)
    theme: {
        extend: {
            colors: {
                // Cyberpunk Theme
                cyber: {
                    black: '#0a0a0f',
                    dark: '#12121e',
                    primary: '#ff0055', // Neon Pink
                    secondary: '#00ccff', // Neon Blue
                    accent: '#ccff00', // Neon Lime
                    text: '#ffffff',
                    muted: '#888899',
                },
                // Paper Theme
                paper: {
                    bg: '#fdfbf7', // Warm paper
                    ink: '#2b2b2b',
                    line: '#a4b0be', // Blueish line
                    highlight: '#fff200', // Highlighter yellow
                    red: '#ff4444',
                }
            },
            fontFamily: {
                cyber: ['Orbitron', 'sans-serif'],
                paper: ['Patrick Hand', 'cursive'],
            },
            backgroundImage: {
                'cyber-grid': "linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)",
                'paper-lines': "repeating-linear-gradient(#fdfbf7, #fdfbf7 20px, #a4b0be 21px, #fdfbf7 22px)",
            }
        },
    },
    plugins: [],
}
