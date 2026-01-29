export type GsmbThemeClass =
  | "dark-theme"
  | "old-brick-theme"
  | "glow-green-theme";

export interface GsmbTheme {
  name: string;
  brightness: ThemeBrightness;
  themeClass: GsmbThemeClass;
}

export type ThemeBrightness = "light" | "dark";

export const THEMES: GsmbTheme[] = [
  {
    name: "Tile",
    brightness: "light",
    themeClass: "old-brick-theme",
  },
  {
    name: "Dark mode",
    brightness: "dark",
    themeClass: "dark-theme",
  },
  {
    name: "Green",
    brightness: "light",
    themeClass: "glow-green-theme",
  },
] as const;
