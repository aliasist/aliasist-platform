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
} satisfies Config;
