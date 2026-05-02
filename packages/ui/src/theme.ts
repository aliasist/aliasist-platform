export const THEME_STORAGE_KEY = "aliasist.theme";

export const THEME_IDS = ["lab", "aurora", "ember"] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export interface ThemeOption {
  id: ThemeId;
  label: string;
  description: string;
}

export const THEMES: ThemeOption[] = [
  {
    id: "lab",
    label: "Lab",
    description: "Current Aliasist default.",
  },
  {
    id: "aurora",
    label: "Aurora",
    description: "A softer, more luminous alternate skin.",
  },
  {
    id: "ember",
    label: "Ember",
    description: "A cinematic sci-fi skin inspired by the concept art.",
  },
];

export const isThemeId = (value: unknown): value is ThemeId =>
  value === "lab" || value === "aurora" || value === "ember";

export const resolveThemeId = (value: string | null | undefined): ThemeId =>
  isThemeId(value) ? value : "lab";

export const readStoredTheme = (): ThemeId | null => {
  if (typeof window === "undefined") return null;
  try {
    return resolveThemeId(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return null;
  }
};

export const writeStoredTheme = (theme: ThemeId): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore storage failures
  }
};

export const applyTheme = (theme: ThemeId): void => {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
};
