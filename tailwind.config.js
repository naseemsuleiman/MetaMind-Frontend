// frontend/tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MetaMind Brand Colors
        'mindful-blue': '#4A6FA5',
        'cognitive-teal': '#3AB8A2',
        'insight-purple': '#7E5BEF',
        'alert-amber': '#FFB74D',
        'calm-green': '#81C784',
        'focus-indigo': '#5C6BC0',
        'metacognitive-gray': '#2D3748',
        'background-light': '#F8FAFC',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}