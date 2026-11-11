import type { DialogType, ThemeMode } from "../../types";
import { IconButton } from "../ui/IconButton";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { CampusDropLogo } from "../ui/CampusDropLogo";

type AppHeaderProps = {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onDialogChange: (dialog: DialogType) => void;
};

export function AppHeader({ theme, onThemeChange, onDialogChange }: AppHeaderProps) {
  return (
    <header className="relative z-20 flex h-14 w-full items-center justify-between px-4 py-2 border-b border-(--border-color)/15">
      {/* Brand Badge */}
      <div className="flex items-center gap-2.5 select-none">
        <CampusDropLogo className="h-8 w-8 text-(--primary-color)" />
        <span className="text-base font-bold tracking-tight text-(--primary-color)">
          Campus Drop
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <IconButton
          label="Join public room temporarily"
          icon="room"
          onClick={() => onDialogChange("room")}
        />
        <IconButton
          label="Pair your devices permanently"
          icon="pair"
          onClick={() => onDialogChange("pair")}
        />
        <ThemeSwitcher theme={theme} onThemeChange={onThemeChange} />
        <IconButton
          label="Set Language"
          icon="language"
          onClick={() => onDialogChange("language")}
        />
        <IconButton
          label="About Campus Drop"
          icon="info"
          onClick={() => onDialogChange("about")}
        />
      </div>
    </header>
  );
}
