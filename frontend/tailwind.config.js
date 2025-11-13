/** @type {import('tailwindcss').Config} */
import path from "path";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    fontFamily: {
      display: ["Poppins", "sans-serif"],
    },
    extend: {
      colors: {
        primary: "#05B6D3",
        secondary: "#EF863E",
      },
      backgroundImage: {
        "login-bg-img": "url('@/assets/images/bg-image.png')",
        "signup-bg-img": "url('@/assets/images/signup-bg-img.png')",
      },
    },
  },
  plugins: [],
};
