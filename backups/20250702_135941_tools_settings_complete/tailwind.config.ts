import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#ffffff",
        "background-secondary": "#0a0a0a",
        "background-tertiary": "#1a1a1a",
        "neon-red": "#ff073a",
        "neon-red-bright": "#ff1744",
        "neon-red-dark": "#cc052e",
        "burnt-orange": "#cc5500",
        "burnt-orange-bright": "#ff6a00",
        "burnt-orange-dark": "#994000",
        "neon-green": "#00ff41",
        "neon-green-bright": "#39ff14",
        "neon-green-dark": "#00cc33",
        border: "#2a2a2a",
        "hover-bg": "#1a1a1a",
        "text-muted": "#a0a0a0",
        "text-secondary": "#e0e0e0",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": {
            boxShadow: "0 0 5px rgb(255, 7, 58), 0 0 10px rgb(255, 7, 58), 0 0 15px rgb(255, 7, 58)",
          },
          "100%": {
            boxShadow: "0 0 10px rgb(255, 7, 58), 0 0 20px rgb(255, 7, 58), 0 0 30px rgb(255, 7, 58)",
          },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;