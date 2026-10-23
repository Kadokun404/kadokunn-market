import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        cream: "#FFF8E7",
        brand: {
          yellow: "#FFD23F",
          pink: "#FF5D8F",
          blue: "#3A86FF",
          green: "#06D6A0",
        },
      },
      fontFamily: {
        display: ["var(--font-archivo)", "system-ui", "sans-serif"],
        sans: ["var(--font-grotesk)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "brutal-sm": "2px 2px 0 #111111",
        brutal: "4px 4px 0 #111111",
        "brutal-lg": "7px 7px 0 #111111",
      },
    },
  },
  plugins: [],
};

export default config;
