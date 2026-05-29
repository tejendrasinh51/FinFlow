import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        canvas: '#080C14',
        surface: '#0D1321',
        elevated: '#121929',
        overlay: '#1A2235',
        cyan: {
          DEFAULT: '#00D4FF',
          dim: '#005F73',
          glow: 'rgba(0,212,255,0.12)',
        },
        positive: '#10B981',
        negative: '#EF4444',
        warning: '#F59E0B',
        neutral: '#6B7280',
        text: {
          primary: '#E8EDF5',
          secondary: '#7A8BA0',
          tertiary: '#3A4A5C',
        },
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(ellipse 70% 40% at 50% -10%, rgba(0,212,255,0.08) 0%, transparent 60%)',
        'cyan-gradient': 'linear-gradient(90deg, #00D4FF, transparent)',
        'card-shine': 'linear-gradient(135deg, rgba(0,212,255,0.05) 0%, transparent 50%)',
      },
      boxShadow: {
        'cyan-sm': '0 0 15px rgba(0,212,255,0.1)',
        'cyan-md': '0 0 30px rgba(0,212,255,0.15)',
        'cyan-lg': '0 0 60px rgba(0,212,255,0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'grid-drift': 'grid-drift 12s linear infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'counter': 'counter 0.6s ease-out forwards',
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'draw-line': 'draw-line 1.5s ease forwards',
      },
      keyframes: {
        'grid-drift': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(60px)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.8)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'draw-line': {
          to: { strokeDashoffset: '0' },
        },
      },
      borderRadius: {
        card: '1rem',
      },
    },
  },
  plugins: [],
}

export default config
