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
        campus: {
          bg: "#0B0C15",
          surface: "#121424",
          card: "#16192E",
          elevated: "#1D213B",
          border: "rgba(255, 255, 255, 0.08)",
          purple: {
            DEFAULT: "#9B42F6",
            light: "#B365FC",
            dark: "#7E22CE",
          },
          pink: {
            DEFAULT: "#E93C9A",
            light: "#F472B6",
            dark: "#BE185D",
          },
          teal: "#10B981",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
