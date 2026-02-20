/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // ── Cyberpunk Theme ──────────────────────────────────────────
                cyber: {
                    black: '#0a0a0f',
                    dark: '#12121e',
                    primary: '#ff0055',
                    secondary: '#00ccff',
                    accent: '#ccff00',
                    text: '#ffffff',
                    muted: '#888899',
                },
                // ── Paper / Hand-drawn Theme ─────────────────────────────────
                paper: {
                    bg: '#fdfbf7',
                    ink: '#2b2b2b',
                    line: '#a4b0be',
                    highlight: '#fff200',
                    red: '#ff4444',
                    mark: '#ffe9a0',
                },
                // ── Dark Mode Theme (Linear-inspired) ────────────────────────
                dark: {
                    bg: '#0d0d0d',
                    surface: '#161616',
                    elevated: '#1e1e1e',
                    border: '#2a2a2a',
                    text: '#ededed',
                    muted: '#737373',
                    subtle: '#a3a3a3',
                    primary: '#7c6dfa',   // Soft purple
                    accent: '#38bdf8',   // Sky blue
                    success: '#34d399',
                },
                // ── Sakura Theme (Japanese cherry blossom) ───────────────────
                sakura: {
                    bg: '#fff5f7',   // Soft blush white
                    surface: '#fff0f3',
                    petal: '#ffd6e0',   // Pale rose
                    blossom: '#ffb3c6',   // Cherry blossom pink
                    deep: '#e8577a',   // Deep cherry
                    ink: '#3d1a24',   // Dark rose ink
                    gold: '#c9955c',   // Warm gold
                    muted: '#c4889a',
                    subtle: '#9e5a6e',
                    green: '#6a9e6a',   // Moss green accent
                },
            },
            fontFamily: {
                cyber: ['Orbitron', 'sans-serif'],
                paper: ['Patrick Hand', 'cursive'],
                dark: ['Inter', 'system-ui', 'sans-serif'],
                sakura: ['Noto Serif JP', 'Georgia', 'serif'],
            },
            backgroundImage: {
                'cyber-grid': "linear-gradient(rgba(0,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.05) 1px, transparent 1px)",
                'paper-lines': "repeating-linear-gradient(#fdfbf7, #fdfbf7 20px, #a4b0be 21px, #fdfbf7 22px)",
                'sakura-petals': "radial-gradient(ellipse at 20% 50%, rgba(255,179,198,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(255,214,224,0.2) 0%, transparent 50%)",
                'dark-dots': "radial-gradient(circle, rgba(124,109,250,0.06) 1px, transparent 1px)",
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '33%': { transform: 'translateY(-6px) rotate(2deg)' },
                    '66%': { transform: 'translateY(-3px) rotate(-1deg)' },
                },
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-4deg)' },
                    '50%': { transform: 'rotate(4deg)' },
                },
                pulse_glow: {
                    '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
                    '50%': { opacity: '0.85', filter: 'brightness(1.2)' },
                },
                petal_fall: {
                    '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '0' },
                    '10%': { opacity: '1' },
                    '100%': { transform: 'translateY(40px) rotate(360deg)', opacity: '0' },
                },
                bounce_soft: {
                    '0%, 100%': { transform: 'translateY(0) scale(1)' },
                    '50%': { transform: 'translateY(-4px) scale(1.05)' },
                },
            },
            animation: {
                'float': 'float 3s ease-in-out infinite',
                'wiggle': 'wiggle 0.5s ease-in-out infinite',
                'pulse-glow': 'pulse_glow 2s ease-in-out infinite',
                'petal-fall': 'petal_fall 4s ease-in-out infinite',
                'bounce-soft': 'bounce_soft 2s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}
