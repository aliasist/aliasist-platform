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
          void: "#080b12",
          surface: "#0e1420",
          mist: "#151d2b",
          purple: "#7dd3fc",
          purpledeep: "#1d4ed8",
          green: "#88cffd",
          greensoft: "#55b5f4",
          amber: "#f6c453",
          orange: "#ffb347",
        },
      },
      boxShadow: {
        "memory-purple":
          "0 0 0 1px rgba(125, 211, 252, 0.16), 0 22px 56px -34px rgba(47, 149, 220, 0.55)",
        "memory-green":
          "0 0 0 1px rgba(136, 207, 253, 0.16), 0 20px 44px -32px rgba(47, 149, 220, 0.45)",
        "memory-amber":
          "0 0 0 1px rgba(246, 196, 83, 0.14), 0 18px 38px -30px rgba(255, 179, 71, 0.3)",
        "memory-inset": "inset 0 1px 0 0 rgba(255,255,255,0.05)",
      },
      backgroundImage: {
        "memory-hero-glow":
          "radial-gradient(ellipse 90% 60% at 50% -18%, rgba(47,149,220,0.24), transparent 58%), radial-gradient(ellipse 55% 45% at 85% 15%, rgba(148,163,184,0.1), transparent 55%), radial-gradient(ellipse 40% 30% at 10% 40%, rgba(255,179,71,0.04), transparent 50%)",
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
