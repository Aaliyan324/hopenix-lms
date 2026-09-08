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
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
        editorial: {
          burgundy: '#8b1e2d',
          terracotta: '#c85a32',
          ink: '#191816',
          warmWhite: '#faf8f5',
          surface: '#ffffff',
          accent: '#2b4c3f',
        },
      },
      borderRadius: {
        'card': '0.75rem',
        'hero': '1.25rem',
        'pill': '9999px',
      },
      boxShadow: {
        'editorial': '0 4px 20px -2px rgba(28, 25, 23, 0.05), 0 2px 6px -1px rgba(28, 25, 23, 0.03)',
        'book': '4px 6px 18px rgba(28, 25, 23, 0.12), 1px 1px 4px rgba(28, 25, 23, 0.08)',
        'card': '0 2px 10px rgba(28, 25, 23, 0.04)',
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


