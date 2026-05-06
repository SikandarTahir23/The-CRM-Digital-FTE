/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme system — depth layering
        surface: {
          DEFAULT: '#050813',    // Page background (deepest)
          sidebar: '#070c14',    // Sidebar (slightly elevated)
          card: '#0d1117',       // Surface cards
          hover: '#111827',      // Card hover state
        },
        border: {
          DEFAULT: '#1e2d3d',    // Standard borders
          subtle: '#0f1929',     // Subtle dividers
        },
        // Accent colors — precise, professional
        accent: {
          cyan: '#22d3ee',       // Primary accent
          violet: '#7c3aed',     // Secondary accent
          success: '#10b981',    // Success/good
          warning: '#f59e0b',    // Warning
          danger: '#ef4444',     // Danger/bad
        },
        // Text colors — high contrast, accessible
        text: {
          primary: '#f1f5f9',    // Primary text
          muted: '#64748b',      // Muted/secondary
        },
        // Legacy primary (violet scale)
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 16px rgba(34, 211, 238, 0.15), 0 0 32px rgba(34, 211, 238, 0.08)',
        'glow-violet': '0 0 16px rgba(124, 58, 237, 0.15), 0 0 32px rgba(124, 58, 237, 0.08)',
        'glow-success': '0 0 16px rgba(16, 185, 129, 0.15), 0 0 32px rgba(16, 185, 129, 0.08)',
        'glow-warning': '0 0 16px rgba(245, 158, 11, 0.15), 0 0 32px rgba(245, 158, 11, 0.08)',
        'glow-danger': '0 0 16px rgba(239, 68, 68, 0.15), 0 0 32px rgba(239, 68, 68, 0.08)',
        // Subtle depth shadows
        'card': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-right': 'slideRight 0.4s ease-out',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'ripple': 'ripple 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '50%': { transform: 'scale(2.5)', opacity: '0' },
          '100%': { transform: 'scale(0.8)', opacity: '0' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.15)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
