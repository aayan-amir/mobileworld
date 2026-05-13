export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        sans: ['Manrope', 'sans-serif']
      },
      colors: {
        navy: '#111827',
        'navy-light': '#243044',
        gold: '#FACC15',
        'gold-light': '#FDE68A',
        paper: '#EEF2F6',
        ink: '#0B1220',
        cobalt: '#2563EB',
        mint: '#10B981',
        coral: '#F97316',
        muted: '#6B7280',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444'
      }
    }
  },
  plugins: []
};
