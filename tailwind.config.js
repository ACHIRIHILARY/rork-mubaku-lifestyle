/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        peach: '#F4A896',
        purple: '#2D1A46',
        'peach-light': '#F7B8A8',
        'purple-light': '#4A2D6B',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
}