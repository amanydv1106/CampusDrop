import { cn } from "@/lib/cn";
import type { IconName } from "../../constants/icons";
import { Icon } from "./Icon";

type IconButtonProps = {
  label: string;
  icon: IconName;
  selected?: boolean;
  onClick?: () => void;
};

export function IconButton({ label, icon, selected, onClick }: IconButtonProps) {
  return (
    <button
      className={cn(
        "icon-button icon-hover-target relative z-0 flex h-10 w-10 items-center justify-center border-0 bg-transparent text-current outline-none transition-all duration-300",
        selected && "selected"
      )}
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
    >
      <Icon name={icon} className="h-6 w-6 fill-current" />
    </button>
  );
}
