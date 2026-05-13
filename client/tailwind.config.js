export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif']
      },
      colors: {
        navy: '#0F1F3D',
        'navy-light': '#1A2F55',
        gold: '#C9A84C',
        'gold-light': '#E8C97A',
        paper: '#F8F9FA',
        ink: '#1A1A2E',
        muted: '#6B7280',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444'
      }
    }
  },
  plugins: []
};
