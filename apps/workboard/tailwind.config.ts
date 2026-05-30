import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#f3f4f6',
          raised: '#eef2f7',
          overlay: '#eef2f7',
          content: '#ffffff',
          active: '#f8fafc',
        },
        border: {
          DEFAULT: '#d7dce5',
          soft: '#c8ced8',
          strong: '#b8bec9',
        },
        accent: {
          DEFAULT: '#1d4ed8',
          muted: '#1e40af',
        },
        operational: {
          text: '#0f172a',
          secondary: '#1e293b',
          muted: '#334155',
        },
        priority: {
          high: '#b45309',
          'high-bg': 'rgba(180, 83, 9, 0.08)',
          urgent: '#b91c1c',
          'urgent-bg': 'rgba(185, 28, 28, 0.08)',
          normal: '#64748b',
          'normal-bg': 'rgba(100, 116, 139, 0.08)',
          done: '#15803d',
          'done-bg': 'rgba(21, 128, 61, 0.08)',
        },
        status: {
          ok: '#16a34a',
          warn: '#d97706',
          error: '#dc2626',
          info: '#0284c7',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'operational-base': ['16px', { lineHeight: '1.5' }],
        'operational-sm': ['14px', { lineHeight: '1.45' }],
        'operational-menu': ['15px', { lineHeight: '1.4' }],
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
