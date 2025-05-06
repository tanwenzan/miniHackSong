/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3498db',
          hover: '#2980b9'
        },
        secondary: {
          DEFAULT: '#2c3e50',
          hover: '#34495e'
        }
      },
      borderRadius: {
        DEFAULT: '8px'
      },
      boxShadow: {
        DEFAULT: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }
    },
  },
  plugins: [],
}