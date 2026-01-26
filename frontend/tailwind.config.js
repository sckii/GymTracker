/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-cream': '#FFFADC',
        'brand-lime': '#B6F500',
        'brand-lime-mid': '#A4DD00',
        'brand-lime-dark': '#98CD00',
        'brand-dark': '#09090b',      // Zinc 950
        'brand-gray': '#18181b',      // Zinc 900
        'brand-light-gray': '#27272a', // Zinc 800
        'brand-border': '#3f3f46',    // Zinc 700
      },
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
    },
  },
  plugins: [],
}
