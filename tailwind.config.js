/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Only tokens the markup actually uses. `primary`, `secondary` and `warning`
      // colours and a `body` font were declared here and referenced nowhere, so the
      // config described a design system the app does not use.
      colors: {
        accent: '#ACE849', // Chartreuse (brand primary)
        success: '#ACE849', // Use brand color
        danger: '#dc2626', // Red (keep for errors)
        charcoal: '#2C2C2C', // Charcoal Black
      },
      fontFamily: {
        headline: ['Manrope', 'Arial', 'Helvetica', 'sans-serif'],
        label: ['Ayuthaya', 'Arial', 'Helvetica', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
