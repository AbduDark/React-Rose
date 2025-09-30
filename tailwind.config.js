import colors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export const content = ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"];
export const theme = {
  extend: {
    colors: {
      primary: "#06d4b5ff",
      secondary: "#3B82F6",
    },
    fontFamily: {
      arabic: ["Cairo", "sans-serif"],
      sans: ["Inter", "ui-sans-serif", "system-ui"],
    },
  },
};
export const plugins = [];
