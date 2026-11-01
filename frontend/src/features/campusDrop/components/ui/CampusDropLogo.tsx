import { iconPaths } from "../../constants/icons";

type CampusDropLogoProps = {
  className?: string;
};

export function CampusDropLogo({ className = "h-20 w-20" }: CampusDropLogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient className="campusdrop-logo-gradient" id="primaryGradient" gradientTransform="rotate(90)">
          <stop offset="0%" />
          <stop offset="100%" />
        </linearGradient>
      </defs>
      <path d={iconPaths.wifi} fill="url(#primaryGradient)" />
    </svg>
  );
}
