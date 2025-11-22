import tailwindcssAnimate from "tailwindcss-animate"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./inertia/**/*.{js,ts,jsx,tsx}",
    "./resources/views/**/*.edge",
  ],
  theme: {
    extend: {},
  },
  plugins: [tailwindcssAnimate],
}
