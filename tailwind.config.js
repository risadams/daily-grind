/** @type {import('tailwindcss').Config} */
const coffeeTheme = require('./src/styles/coffeeTheme');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    ...coffeeTheme,
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};