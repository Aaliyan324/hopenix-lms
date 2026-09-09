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
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
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
          warmWhite: '#fff7ed',
          surface: '#ffffff',
          accent: '#f97316',
          muted: '#ffedd5',
          light: '#fdba74',
        },
      },
      backgroundImage: {
        'warm-gradient': 'linear-gradient(180deg, #fff7ed 0%, #ffedd5 50%, #fff7ed 100%)',
        'orange-radial': 'radial-gradient(ellipse at top, #f97316 0%, transparent 70%)',
      },
      borderRadius: {
        'card': '0.75rem',
        'hero': '1.25rem',
        'pill': '9999px',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'editorial': '0 4px 20px -2px rgba(249, 115, 22, 0.06), 0 2px 6px -1px rgba(249, 115, 22, 0.03)',
        'book': '4px 6px 18px rgba(15, 23, 42, 0.08), 1px 1px 4px rgba(15, 23, 42, 0.04)',
        'card': '0 2px 10px rgba(15, 23, 42, 0.04)',
        'warm': '0 4px 20px rgba(249, 115, 22, 0.08), 0 2px 8px rgba(249, 115, 22, 0.04)',
        'warm-lg': '0 12px 40px rgba(249, 115, 22, 0.1), 0 4px 12px rgba(249, 115, 22, 0.05)',
        'glass': '0 8px 32px rgba(249, 115, 22, 0.06)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.8' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        float: 'float 3s ease-in-out infinite',
        pulseSoft: 'pulseSoft 2s ease-in-out infinite',
        fadeIn: 'fadeIn 0.5s ease-out',
        slideUp: 'slideUp 0.6s ease-out',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
      },
      maxWidth: {
        'measure': '68ch',
        'prose': '72ch',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}