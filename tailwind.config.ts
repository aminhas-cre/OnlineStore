import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { blush: "#f7e7e4", rose: "#b5586b", ink: "#2b2326" },
      fontFamily: { serif: ["Georgia", "serif"] },
    },
  },
  plugins: [],
};
export default config;
