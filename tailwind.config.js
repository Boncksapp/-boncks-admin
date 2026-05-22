/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F9A825',
        dark: '#0A0A0A',
        surface: '#1A1A1A',
        gray: {
          text: '#A0A0A0',
        }
      }
    },
  },
  plugins: [],
}
