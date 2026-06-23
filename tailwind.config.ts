import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#06111f",
          900: "#091a2f",
          800: "#102542",
        },
        volt: "#2df6c8",
      },
      boxShadow: {
        glow: "0 0 40px rgba(45, 246, 200, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
