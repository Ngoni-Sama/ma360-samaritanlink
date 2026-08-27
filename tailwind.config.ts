import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Matched to medaccess360.com: teal #2c7a7b, deep teal #184a45,
        // ink #0d141a, light teal tint #e3f6f5, warm accent #ffcd35.
        brand: {
          50: "#eef7f7",
          100: "#e3f6f5",
          200: "#c4e7e6",
          300: "#9bd4d3",
          400: "#5fb5b5",
          500: "#359596",
          600: "#2c7a7b",
          700: "#245f60",
          800: "#184a45",
          900: "#123a37",
          950: "#0d2523",
        },
        ink: {
          50: "#f4f6f7",
          100: "#e6eaec",
          200: "#ccd3d7",
          300: "#a4b0b6",
          400: "#74858d",
          500: "#586a72",
          600: "#45535a",
          700: "#3a454b",
          800: "#232c31",
          900: "#0d141a",
          950: "#070c10",
        },
        accent: {
          400: "#ffd868",
          500: "#ffcd35",
          600: "#fea419",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "'Open Sans'", "system-ui", "sans-serif"],
        display: ["'Open Sans'", "system-ui", "sans-serif"],
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
