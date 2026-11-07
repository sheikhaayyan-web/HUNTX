/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        huntx: {
          bg: '#0A0A0A',
          card: '#141414',
          surface: '#171717',
          surfaceLight: '#222222',
          border: '#303030',
          borderLight: '#444444',
          accent: '#FF8A00',
          accentHover: '#FFA133',
          accentGlow: 'rgba(255, 138, 0, 0.25)',
          hunter: '#EF4444',
          hunterDark: '#7F1D1D',
          runner: '#10B981',
          runnerDark: '#064E3B',
          spectator: '#8B5CF6',
          text: '#FFFFFF',
          muted: '#A0A0A0',
          darkMuted: '#666666'
        }
      },
      fontFamily: {
        sans: ['Rajdhani', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Teko', 'Rajdhani', 'Impact', 'sans-serif']
      },
      boxShadow: {
        'glow-orange': '0 0 20px rgba(255, 138, 0, 0.35)',
        'glow-hunter': '0 0 20px rgba(239, 68, 68, 0.35)',
        'glow-runner': '0 0 20px rgba(16, 185, 129, 0.35)',
      },
      keyframes: {
        pulseZone: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.9' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      animation: {
        'pulse-zone': 'pulseZone 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar': 'radarSweep 4s linear infinite',
      }
    },
  },
  plugins: [],
}
