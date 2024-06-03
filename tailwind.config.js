/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'home-pattern': "url('../home-bg.png')",
      },
      screens: {
        'md': '400px',
      },
      colors: {
        black: '#131212',
        'dark-gray': '#2C2A2A',
        'gray-300': 'rgb(55, 52, 52)',
        'gray-400': 'rgb(44, 42, 42)',
        gray: '#868383',
        orange: '#FFA500',
        danger: '#AD3C07',
        'danger-100': '#F74F4F',
        'modal-dark': 'rgb(37, 35, 35)',
        overlay: 'rgba(10, 9, 9, 0.7)',
      },
    },
  },
  plugins: [],
};
