import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#4f46e5',
          soft: '#e0e7ff',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
