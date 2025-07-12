/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'], // Assuming Inter font
      },
      colors: {
        primary: '#6366F1', // Example primary color
        secondary: '#8B5CF6', // Example secondary color
        accent: '#EC4899', // Example accent color
      },
    },
  },
  plugins: [],
}