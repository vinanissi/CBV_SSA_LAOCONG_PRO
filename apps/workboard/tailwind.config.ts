import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f1419',
          raised: '#1a2332',
          overlay: '#243044',
        },
        border: {
          DEFAULT: '#2d3a4f',
          soft: '#3d4f6a',
        },
        accent: {
          DEFAULT: '#3b82f6',
          muted: '#2563eb',
        },
        status: {
          ok: '#22c55e',
          warn: '#eab308',
          error: '#ef4444',
          info: '#06b6d4',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      minWidth: {
        shell: '1366px',
      },
    },
  },
  plugins: [],
} satisfies Config;
