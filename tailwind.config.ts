import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        peza: {
          blue: "#082664",
          navy: "#061b49",
          cyan: "#14b8e6",
          red: "#d40000",
          gold: "#facc15",
        },
      },
      boxShadow: {
        premium: "0 24px 80px rgba(6, 27, 73, 0.16)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
