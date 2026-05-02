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
        dark: {
          DEFAULT: "#050510",
          card: "rgba(15, 15, 40, 0.6)",
          border: "rgba(255, 255, 255, 0.08)",
        },
        accent: {
          blue: "#0ea5e9",
          purple: "#8b5cf6",
          cyan: "#06b6d4",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["GeistMono", "ui-monospace", "monospace"],
      },
      animation: {
        "gradient-shift": "gradient-shift 8s ease infinite",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 10s ease-in-out infinite",
        "float-slower": "float 14s ease-in-out infinite",
        pulse2: "pulse2 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "typing": "typing 1.5s steps(30) infinite alternate, blink 0.7s step-end infinite",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        pulse2: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(14, 165, 233, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(139, 92, 246, 0.5)" },
        },
        blink: {
          "50%": { borderColor: "transparent" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
