/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        ink: {
          DEFAULT: '#0F172A',
          secondary: '#475569',
          muted: '#94A3B8',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F8FBFF',
        },
      },
      borderRadius: {
        card: '20px',
        sidebar: '0px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.04), 0 8px 24px -12px rgba(37,99,235,.10)',
        'card-hover': '0 4px 8px rgba(15,23,42,.06), 0 16px 32px -12px rgba(37,99,235,.16)',
        sidebar: '2px 0 16px rgba(37,99,235,.06)',
      },
      backgroundImage: {
        'app-shell': 'linear-gradient(160deg, #DAECFF 0%, #EEF5FF 45%, #F5F9FF 100%)',
        'auth-brand': 'linear-gradient(145deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%)',
      },
    },
  },
  plugins: [],
};
