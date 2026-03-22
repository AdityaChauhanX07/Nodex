/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        bg: {
          primary: '#0A0A0F',
          surface: '#12121A',
          elevated: '#1A1A2E',
        },
        accent: {
          purple: '#7C3AED',
          'purple-light': '#A78BFA',
          teal: '#06B6D4',
          green: '#22C55E',
          red: '#EF4444',
          amber: '#F59E0B',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          from: { boxShadow: '0 0 20px #7C3AED40' },
          to: { boxShadow: '0 0 40px #7C3AED80, 0 0 80px #7C3AED40' },
        },
      },
    },
  },
  plugins: [],
}
