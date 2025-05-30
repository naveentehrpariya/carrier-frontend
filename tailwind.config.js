/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.3rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    extend: {
      fontFamily: {
        custom: ['productsans', 'sans-serif'],
      },
      rotate: {
        '30': '30deg',
        '270': '270deg',
      }
    },
  },
  plugins: [],
}

