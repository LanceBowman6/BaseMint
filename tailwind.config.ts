import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          blue: "#0052ff",
          cyan: "#22d3ee",
          ink: "#07111f",
          panel: "#0d1f33",
        },
      },
      boxShadow: {
        glow: "0 0 40px rgba(0, 82, 255, 0.28)",
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(0.96)", opacity: "0.8" },
          "100%": { transform: "scale(1.35)", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.1s ease-out infinite",
        float: "float 4.5s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
