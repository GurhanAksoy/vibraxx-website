/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 🔄 İleride dark/light geçişi için hazır
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /* 🧠 VibraXX Theme Tokens (globals.css ile senkronize) */
      colors: {
        vibra: {
          bg: 'var(--vibra-bg)',
          surface: 'var(--vibra-surface)',
          card: 'var(--vibra-card)',
          text: 'var(--vibra-text)',
          'text-muted': 'var(--vibra-text-muted)',
          cyan: 'var(--vibra-cyan)',
          magenta: 'var(--vibra-magenta)',
          purple: 'var(--vibra-purple)',
          blue: 'var(--vibra-blue)',
          yellow: 'var(--vibra-yellow)',
          red: 'var(--vibra-red)',
        },
      },

      /* 📱 Breakpoints */
      screens: {
        xs: '480px',
      },

      /* 🖋️ Font */
      fontFamily: {
        sans: [
          'Inter',
          'Segoe UI',
          'Segoe UI Emoji',
          'Apple Color Emoji',
          'Noto Color Emoji',
          'system-ui',
          'sans-serif',
        ],
      },

      /* 💡 Shadow ve Glow efektleri */
      boxShadow: {
        neon: '0 0 8px rgba(33,243,243,0.45), 0 0 18px rgba(243,33,193,0.35)',
        'neon-strong': '0 0 20px rgba(33,243,243,0.6), 0 0 40px rgba(243,33,193,0.4)',
      },

      /* 🌀 Animasyon hızları */
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },

      borderRadius: {
        vibra: 'var(--vibra-radius)',
      },
    },
  },

  /* 🔌 Resmi Tailwind eklentileri */
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
