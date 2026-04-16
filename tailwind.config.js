/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // This will scan all files in src folder
  ],
  theme: {
    extend: {
      colors: {
        'zim-cobalt': '#0F2449',
        'zim-green': '#39FF14',
      },
    },
  },
  plugins: [],
}