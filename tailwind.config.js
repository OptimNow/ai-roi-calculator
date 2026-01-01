/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ACE849', // Chartreuse
        secondary: '#F4F4F4', // Light Grey
        accent: '#ACE849', // Chartreuse (brand primary)
        success: '#ACE849', // Use brand color
        warning: '#C1C1C1', // Dark Grey
        danger: '#dc2626', // Red (keep for errors)
        charcoal: '#2C2C2C', // Charcoal Black
      }
    }
  },
  plugins: [],
}
