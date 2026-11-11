import type { DialogType, ThemeMode } from "../../types";
import { IconButton } from "../ui/IconButton";
import { ThemeSwitcher } from "./ThemeSwitcher";

type AppHeaderProps = {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onDialogChange: (dialog: DialogType) => void;
};

export function AppHeader({ theme, onThemeChange, onDialogChange }: AppHeaderProps) {
  return (
    <header className="relative z-20 flex min-h-14 w-screen flex-row-reverse items-start px-3 py-2 max-[560px]:px-2 *:mx-1">
      <IconButton label="About Campus Drop" icon="info" onClick={() => onDialogChange("about")} />
      <IconButton label="Set Language" icon="language" onClick={() => onDialogChange("language")} />
      <ThemeSwitcher theme={theme} onThemeChange={onThemeChange} />
      <IconButton
        label="Pair your devices permanently"
        icon="pair"
        onClick={() => onDialogChange("pair")}
      />
      <IconButton
        label="Join public room temporarily"
        icon="room"
        onClick={() => onDialogChange("room")}
      />
    </header>
  );
}
