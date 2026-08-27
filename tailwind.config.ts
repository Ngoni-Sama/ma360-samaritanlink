import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MA360 SamaritanLink palette — clinical teal + deep institutional navy.
        brand: {
          50: "#eefcfb",
          100: "#d3f5f3",
          200: "#abe9e7",
          300: "#73d7d5",
          400: "#39bcbc",
          500: "#1fa0a3",
          600: "#158084",
          700: "#15666b",
          800: "#165256",
          900: "#164448",
          950: "#062a2d",
        },
        ink: {
          50: "#f4f7fa",
          100: "#e6ecf3",
          200: "#cdd9e6",
          300: "#a6bacf",
          400: "#7893b3",
          500: "#57739a",
          600: "#435b80",
          700: "#374a68",
          800: "#314057",
          900: "#0f1b2d",
          950: "#0a1220",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(9, 30, 45, 0.12)",
        "glass-lg": "0 20px 60px rgba(9, 30, 45, 0.18)",
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
