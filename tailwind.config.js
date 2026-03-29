/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        drift: {
          from: { transform: 'translate(0,0) scale(1)' },
          to:   { transform: 'translate(40px,30px) scale(1.08)' },
        },
        blink: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.35', transform: 'scale(0.8)' },
        },
      },
      animation: {
        'drift-1': 'drift 14s ease-in-out infinite alternate',
        'drift-2': 'drift 10s ease-in-out -5s infinite alternate',
        'drift-3': 'drift 18s ease-in-out -9s infinite alternate',
        'blink':   'blink 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
