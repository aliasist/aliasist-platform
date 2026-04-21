/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        // Aliasist palette — dark lab with UFO-green accents and warm signal highlights
        ink: {
          950: "#07090c", // deepest background
          900: "#0c1014", // panel base
          800: "#131820", // elevated panel
          700: "#1b2230", // border-strong
          600: "#283244", // border
          500: "#3a475d",
          400: "#5a6681",
          300: "#8893ae",
          200: "#b9c1d4",
          100: "#dde2ec",
          50: "#f3f5f9",
        },
        ufo: {
          // UFO-green — primary accent
          50: "#e9fff1",
          100: "#c5ffdc",
          200: "#8dffc0",
          300: "#4dfaa4",
          400: "#20ed8a",
          500: "#0bcf72", // primary
          600: "#06a85c",
          700: "#07834a",
          800: "#0a683d",
          900: "#0b5633",
        },
        signal: {
          // warm highlight (status, storm warnings)
          400: "#ffb347",
          500: "#ff8a3b",
          600: "#ea5f1c",
        },
        danger: {
          500: "#ef4444",
          600: "#dc2626",
        },
      },
      fontFamily: {
        sans: [
          '"Inter Variable"',
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        display: [
          '"Cabinet Grotesk"',
          '"General Sans"',
          '"Inter Variable"',
          "Inter",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      boxShadow: {
        panel:
          "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 10px 30px -12px rgba(0,0,0,0.6)",
        glow: "0 0 0 1px rgba(11,207,114,0.2), 0 0 32px -8px rgba(11,207,114,0.35)",
      },
      backgroundImage: {
        grid:
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "scanlines":
          "repeating-linear-gradient(to bottom, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px)",
      },
      backgroundSize: {
        grid: "32px 32px",
      },
      borderRadius: {
        panel: "14px",
      },
    },
  },
  plugins: [],
};
