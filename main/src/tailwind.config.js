/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["index.html"],
  purge: false,
  theme: {
    extend: {
      colors: {
        'custom-blue': '#06283D',
        'custom-green': '#789012',
      },
    },
  },
  plugins: [],
}

