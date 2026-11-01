import { iconPaths, type IconName } from "../../constants/icons";

type IconProps = {
  name: IconName;
  className?: string;
};

export function Icon({ name, className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d={iconPaths[name]} />
    </svg>
  );
}
