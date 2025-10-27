/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d5ff',
          300: '#a5b6ff',
          400: '#7a8aff',
          500: '#5c6aff',
          600: '#4852ff',
          700: '#3b43e8',
          800: '#1a237e',
          900: '#181c6b',
          950: '#0f1245',
        },
        gold: '#D4AF37',
        'dark-blue': '#1a237e',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1a237e 0%, #4852ff 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(26, 35, 126, 0.5)',
        'glow-lg': '0 0 40px rgba(26, 35, 126, 0.6)',
        'gold': '0 0 20px rgba(212, 175, 55, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
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
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

