/** @type {import('tailwindcss').Config} */
const coffeeTheme = require('./src/styles/coffeeTheme');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    ...coffeeTheme,
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};