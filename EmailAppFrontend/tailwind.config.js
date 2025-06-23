/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#60a5fa', // blue-400
          DEFAULT: '#2563eb', // blue-600
          dark: '#1e40af', // blue-800
        },
        accent: {
          light: '#fbbf24', // amber-400
          DEFAULT: '#f59e42', // custom orange
          dark: '#b45309', // amber-800
        },
        background: {
          light: '#f9fafb', // gray-50
          DEFAULT: '#f3f4f6', // gray-100
          dark: '#1f2937', // gray-800
        },
        surface: {
          light: '#ffffff', // white
          DEFAULT: '#f8fafc', // slate-50
          dark: '#23272f', // custom dark surface
        },
        border: {
          light: '#e5e7eb', // gray-200
          DEFAULT: '#d1d5db', // gray-300
          dark: '#374151', // gray-700
        },
        text: {
          light: '#111827', // gray-900
          DEFAULT: '#374151', // gray-700
          dark: '#f3f4f6', // gray-100
          secondary: {
            light: '#6b7280', // gray-500
            dark: '#a1a1aa', // zinc-400
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-8px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(8px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s cubic-bezier(0.4,0,0.2,1) both',
        shake: 'shake 0.5s cubic-bezier(0.4,0,0.2,1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
  darkMode: 'class',
} 