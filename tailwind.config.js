/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        display: ['Newsreader', 'Georgia', 'Cambria', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        editorial: {
          burgundy: '#9a3412',
          terracotta: '#ea580c',
          ink: '#0f172a',
          warmWhite: '#f8fafc',
          surface: '#ffffff',
          accent: '#f97316',
        },
      },
      borderRadius: {
        'card': '0.75rem',
        'hero': '1.25rem',
        'pill': '9999px',
      },
      boxShadow: {
        'editorial': '0 4px 20px -2px rgba(249, 115, 22, 0.06), 0 2px 6px -1px rgba(249, 115, 22, 0.03)',
        'book': '4px 6px 18px rgba(15, 23, 42, 0.08), 1px 1px 4px rgba(15, 23, 42, 0.04)',
        'card': '0 2px 10px rgba(15, 23, 42, 0.04)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
  plugins: [],
}