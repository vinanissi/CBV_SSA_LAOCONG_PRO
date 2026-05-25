import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f172a',
          raised: '#111827',
          overlay: '#101828',
          content: '#1e293b',
        },
        border: {
          DEFAULT: '#334155',
          soft: '#475569',
        },
        accent: {
          DEFAULT: '#3b82f6',
          muted: '#2563eb',
        },
        priority: {
          high: '#b45309',
          'high-bg': 'rgba(180, 83, 9, 0.12)',
          urgent: '#b91c1c',
          'urgent-bg': 'rgba(185, 28, 28, 0.12)',
          normal: '#64748b',
          'normal-bg': 'rgba(100, 116, 139, 0.12)',
          done: '#4ade80',
          'done-bg': 'rgba(74, 222, 128, 0.08)',
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
      width: {
        detail: '400px',
      },
    },
  },
  plugins: [],
} satisfies Config;
