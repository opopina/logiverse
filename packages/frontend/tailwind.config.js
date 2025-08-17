/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // LogiVerse Brand Colors
        'loggie-orange': '#F97316',
        'intelligence-blue': '#2563EB',
        'magic-purple': '#7C3AED',
        'growth-green': '#10B981',
        'energy-yellow': '#F59E0B',
        'challenge-red': '#EF4444',
        carbon: '#374151',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        source: ['Source Sans Pro', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        wiggle: 'wiggle 1s ease-in-out infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      boxShadow: {
        loggie: '0 4px 20px rgba(249, 115, 22, 0.3)',
        magic: '0 4px 20px rgba(124, 58, 237, 0.3)',
      },
    },
  },
  plugins: [],
};
