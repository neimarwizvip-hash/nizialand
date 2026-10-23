/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nisia-blue': {
          DEFAULT: '#2563eb',
          dark: '#1d4ed8',
          light: '#60a5fa',
          deep: '#1e3a8a',
          glow: 'rgba(59, 130, 246, 0.6)'
        },
        'nizia-blue': {
          DEFAULT: '#2563eb',
          dark: '#1d4ed8',
          light: '#60a5fa',
          deep: '#1e3a8a',
          glow: 'rgba(59, 130, 246, 0.6)'
        },
        'nisia-purple': {
          DEFAULT: '#7c3aed',
          dark: '#6d28d9',
          light: '#c084fc',
          deep: '#4c1d95',
          glow: 'rgba(168, 85, 247, 0.6)'
        },
        'nizia-purple': {
          DEFAULT: '#7c3aed',
          dark: '#6d28d9',
          light: '#c084fc',
          deep: '#4c1d95',
          glow: 'rgba(168, 85, 247, 0.6)'
        },
        'nisia-gold': {
          DEFAULT: '#f59e0b',
          light: '#fde047',
          dark: '#b45309',
          glow: 'rgba(245, 158, 11, 0.6)'
        },
        'nizia-gold': {
          DEFAULT: '#f59e0b',
          light: '#fde047',
          dark: '#b45309',
          glow: 'rgba(245, 158, 11, 0.6)'
        },
        'nisia-green': {
          DEFAULT: '#10b981',
          light: '#6ee7b7',
          dark: '#047857'
        },
        'nizia-green': {
          DEFAULT: '#10b981',
          light: '#6ee7b7',
          dark: '#047857'
        }
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        bungee: ['Bungee', 'Outfit', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'game-sm': '0 4px 0 #1e293b',
        'game': '0 6px 0 #1e293b',
        'game-lg': '0 10px 0 #0f172a',
        'game-blue': '0 8px 0 #1e3a8a, 0 12px 24px rgba(37, 99, 235, 0.4)',
        'game-purple': '0 8px 0 #4c1d95, 0 12px 24px rgba(124, 58, 237, 0.4)',
        'game-gold': '0 8px 0 #b45309, 0 12px 24px rgba(245, 158, 11, 0.45)',
        'game-green': '0 8px 0 #065f46, 0 12px 24px rgba(16, 185, 129, 0.4)',
        'glow-blue': '0 0 25px rgba(59, 130, 246, 0.8)',
        'glow-purple': '0 0 25px rgba(168, 85, 247, 0.8)',
        'glow-gold': '0 0 25px rgba(245, 158, 11, 0.8)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'bounce-slight': 'bounceSlight 1.5s infinite ease-in-out',
        'shake-wrong': 'wrongShake 0.5s ease-in-out',
        'pulse-correct': 'correctPulse 0.6s ease-in-out',
        'ze-slide-in': 'zeSlideIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'card-shuffle': 'cardShuffle 0.45s ease-in-out 3',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))' },
          '50%': { transform: 'scale(1.03)', filter: 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.95))' },
        },
        bounceSlight: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        wrongShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-8px)' },
          '40%, 80%': { transform: 'translateX(8px)' },
        },
        correctPulse: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        zeSlideIn: {
          '0%': { transform: 'translateX(120%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        cardShuffle: {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '25%': { transform: 'translateX(-14px) rotate(-6deg)' },
          '75%': { transform: 'translateX(14px) rotate(6deg)' },
        }
      }
    },
  },
  plugins: [],
}
