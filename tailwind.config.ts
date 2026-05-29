import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Claude.ai-inspired palette
        cream: '#F5F4EE',
        paper: '#FAF9F5',
        ink: '#1F1E1D',
        muted: '#8C8A82',
        rule: '#E8E6DD',
        clay: '#C96442', // Claude's signature accent
        sidebar: '#EFEDE4',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        serif: ['"Source Serif Pro"', 'ui-serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
