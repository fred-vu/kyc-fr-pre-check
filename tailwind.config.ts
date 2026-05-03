import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        ink: "#181d26",
        body: "#333840",
        muted: "#5f6368",
        line: "#e0e2e6",
        panel: "#f8fafc",
        "panel-strong": "#e8eaed",
        dark: "#181d26",
        "dark-elevated": "#1f2229",
        accent: "#1b61c9",
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
      },
      spacing: {
        section: "64px",
      },
    },
  },
  plugins: [],
};

export default config;
