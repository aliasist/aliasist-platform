/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        // Aliasist palette — quiet dark product surface with cool intelligence accents.
        ink: {
          950: "#080b12",
          900: "#0e1420",
          800: "#151d2b",
          700: "#202b3d",
          600: "#303d52",
          500: "#49576d",
          400: "#6d7a90",
          300: "#9ca7b8",
          200: "#c4cbd6",
          100: "#e2e7ef",
          50: "#f7f9fc",
        },
        ufo: {
          50: "#eef8ff",
          100: "#d7efff",
          200: "#b8e2ff",
          300: "#88cffd",
          400: "#55b5f4",
          500: "#2f95dc",
          600: "#2178bc",
          700: "#1d6199",
          800: "#1d527f",
          900: "#1f4569",
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
          "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 18px 45px -30px rgba(0,0,0,0.75)",
        glow: "0 0 0 1px rgba(47,149,220,0.18), 0 18px 40px -26px rgba(47,149,220,0.45)",
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
      keyframes: {
        "aurora-1": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)", opacity: "0.45" },
          "33%": { transform: "translate(18%, -8%) scale(1.08)", opacity: "0.62" },
          "66%": { transform: "translate(-12%, 10%) scale(0.96)", opacity: "0.52" },
        },
        "aurora-2": {
          "0%, 100%": { transform: "translate(0, 0) scale(1.03)", opacity: "0.35" },
          "40%": { transform: "translate(-16%, -14%) scale(1.12)", opacity: "0.5" },
          "75%": { transform: "translate(14%, 8%) scale(0.92)", opacity: "0.4" },
        },
        "aurora-3": {
          "0%, 100%": { transform: "translate(-6%, 4%) scale(1.05)", opacity: "0.28" },
          "50%": { transform: "translate(10%, -18%) scale(1.15)", opacity: "0.42" },
        },
        "grid-drift": {
          "0%": { backgroundPosition: "0 0, 0 0" },
          "100%": { backgroundPosition: "32px 32px, 32px 32px" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-gentle": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-6px) rotate(0.8deg)" },
        },
        "sheen": {
          "0%": { transform: "translateX(-120%) skewX(-12deg)" },
          "100%": { transform: "translateX(220%) skewX(-12deg)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 46%" },
          "50%": { backgroundPosition: "100% 54%" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.55", filter: "brightness(1)" },
          "50%": { opacity: "0.95", filter: "brightness(1.15)" },
        },
        "shimmer-line": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        scanlines: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(20px)" },
        },
      },
      animation: {
        "aurora-1": "aurora-1 22s ease-in-out infinite",
        "aurora-2": "aurora-2 28s ease-in-out infinite",
        "aurora-3": "aurora-3 24s ease-in-out infinite",
        "grid-drift": "grid-drift 48s linear infinite",
        "float-slow": "float-slow 7s ease-in-out infinite",
        "float-gentle": "float-gentle 9s ease-in-out infinite",
        sheen: "sheen 2.4s ease-in-out infinite",
        "fade-up":
          "fade-up 0.75s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.5s ease-out both",
        "gradient-shift": "gradient-shift 10s ease infinite",
        "pulse-soft": "pulse-soft 3.2s ease-in-out infinite",
        "shimmer-line": "shimmer-line 4s linear infinite",
        scanlines: "scanlines 6s linear infinite",
      },
      transitionDuration: {
        250: "250ms",
        350: "350ms",
        450: "450ms",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};
