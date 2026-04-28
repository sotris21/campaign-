import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Reform UK brand
        gold: {
          DEFAULT: "#f5c518",
          50: "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          400: "#facc15",
          500: "#f5c518",
          600: "#ca8a04",
          700: "#a16207",
          800: "#854d0e",
          900: "#713f12",
        },
        campaign: {
          black: "#0a0a0a",
          dark: "#1a1a1a",
          card: "#1e1e1e",
          border: "#2a2a2a",
          muted: "#888888",
          gold: "#f5c518",
          "gold-muted": "#d4a915",
          white: "#ffffff",
          danger: "#ef4444",
          success: "#22c55e",
          warning: "#f59e0b",
          info: "#3b82f6",
        },
        // Status colours
        status: {
          draft: "#6b7280",
          needs_review: "#f59e0b",
          approved: "#22c55e",
          exported: "#3b82f6",
          scheduled_manually: "#8b5cf6",
          rejected: "#ef4444",
          archived: "#9ca3af",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
