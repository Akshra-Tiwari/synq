import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        steel:    { DEFAULT: '#6D8196', light: '#B0C4DE' },
        teal:     { DEFAULT: '#01796F', dark: '#015a53', light: '#00b4a6' },
        charcoal: '#5A5A5A',
        synq: {
          bg:      '#08120A',
          surface: '#0D131C',
          s2:      '#121A26',
          border:  'rgba(109,129,150,0.12)',
          text1:   '#DCE4EC',
          text2:   '#94A2AF',
          text3:   '#50606E',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        teal:  '0 4px 20px rgba(1,121,111,0.3)',
        steel: '0 4px 20px rgba(109,129,150,0.2)',
        glow:  '0 0 40px rgba(1,121,111,0.15)',
      },
      animation: {
        'fade-up':    'fadeInUp 0.35s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
