/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          black: '#0F172A',
          gold: '#475569',
          goldlight: '#E2E8F0',
          golddark: '#1E293B',
          cream: '#FFFFFF',
          darkcream: '#F1F5F9',
          white: '#FFFFFF',
          darkgray: '#0F172A',
          mediumgray: '#1E293B',
          gray: '#64748B',
          lightgray: '#F8FAFC',
        }
      },
      fontFamily: {
        serif: ['"Inter"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      letterSpacing: {
        widest: '.15em',
        luxury: '.2em',
      }
    },
  },
  plugins: [],
}
