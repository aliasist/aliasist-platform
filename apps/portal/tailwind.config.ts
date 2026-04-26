import type { Config } from "tailwindcss";
import preset from "@aliasist/config/tailwind";

export default {
  presets: [preset],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    "../../sists/*/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        memory: {
          void: "#050506",
          surface: "#0b0b0f",
          mist: "#0e0e14",
          purple: "#a78bfa",
          purpledeep: "#6d28d9",
          green: "#34d399",
          greensoft: "#10b981",
          amber: "#fbbf24",
          orange: "#fb923c",
        },
      },
      boxShadow: {
        "memory-purple":
          "0 0 0 1px rgba(167, 139, 250, 0.2), 0 0 56px -18px rgba(109, 40, 217, 0.5)",
        "memory-green":
          "0 0 0 1px rgba(52, 211, 153, 0.22), 0 0 40px -14px rgba(16, 185, 129, 0.4)",
        "memory-amber":
          "0 0 0 1px rgba(251, 191, 36, 0.15), 0 0 28px -10px rgba(251, 146, 60, 0.25)",
        "memory-inset": "inset 0 1px 0 0 rgba(255,255,255,0.05)",
      },
      backgroundImage: {
        "memory-hero-glow":
          "radial-gradient(ellipse 90% 60% at 50% -18%, rgba(109,40,217,0.42), transparent 58%), radial-gradient(ellipse 55% 45% at 85% 15%, rgba(52,211,153,0.1), transparent 55%), radial-gradient(ellipse 40% 30% at 10% 40%, rgba(251,146,60,0.04), transparent 50%)",
        "memory-hero-vignette":
          "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(5,5,6,0.75) 100%)",
        "memory-grid":
          "linear-gradient(rgba(255,255,255,0.038) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.038) 1px, transparent 1px)",
      },
      backgroundSize: {
        "memory-grid": "28px 28px",
      },
    },
  },
} satisfies Config;
