import type { ThemeMode } from "../../types";
import { IconButton } from "../ui/IconButton";

type ThemeSwitcherProps = {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
};

export function ThemeSwitcher({ theme, onThemeChange }: ThemeSwitcherProps) {
  return (
    <div className="theme-wrapper relative flex flex-col">
      <IconButton
        label="Adapt theme to system automatically"
        icon="auto"
        selected={theme === "auto"}
        onClick={() => onThemeChange("auto")}
      />
      <div className="flex flex-col">
        <IconButton
          label="Always use light theme"
          icon="sun"
          selected={theme === "light"}
          onClick={() => onThemeChange("light")}
        />
        <IconButton
          label="Always use dark theme"
          icon="moon"
          selected={theme === "dark"}
          onClick={() => onThemeChange("dark")}
        />
      </div>
    </div>
  );
}
