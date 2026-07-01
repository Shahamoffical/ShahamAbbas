/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './pricing-section.html',
    './pages/**/*.html',
    './app.js',
    './src/**/*.{html,js}',
    './*.{html,js}'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
