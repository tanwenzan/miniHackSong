/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1', // Indigo-500
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
          hover: '#4f46e5' // Indigo-600
        },
        secondary: {
          DEFAULT: '#0f172a', // Slate-900
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
          hover: '#1e293b' // Slate-800
        },
        accent: {
          DEFAULT: '#8b5cf6', // Violet-500
          hover: '#7c3aed' // Violet-600
        },
        success: '#10b981', // Emerald-500
        warning: '#f59e0b', // Amber-500
        error: '#ef4444', // Red-500
        info: '#3b82f6', // Blue-500
      },
      borderRadius: {
        DEFAULT: '8px',
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        DEFAULT: '0 2px 10px rgba(0, 0, 0, 0.1)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'nft': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 15px rgba(99, 102, 241, 0.5)',
        'inner-glow': 'inset 0 0 15px rgba(99, 102, 241, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(to right, #6366f1, #8b5cf6)',
        'gradient-secondary': 'linear-gradient(to right, #0f172a, #1e293b)',
        'gradient-card': 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.05))',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}