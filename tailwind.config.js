/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e9fe',
          200: '#bae0fd',
          300: '#7cc5fd',
          400: '#36a6f9',
          500: '#0c87eb',
          600: '#0069cb',
          700: '#0054a6',
          800: '#054788',
          900: '#0a3b70',
          950: '#07254a',
        },
      },
    },
  },
  plugins: [],
}
