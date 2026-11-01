import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  quiet?: boolean;
};

export function AppButton({ className, quiet = false, ...props }: AppButtonProps) {
  return (
    <button
      className={cn(
        "button-hover-target relative inline-flex min-h-6.5 items-center justify-center overflow-hidden border-0 px-4 pb-0 pt-0.5 text-sm font-bold uppercase leading-6 tracking-[0.12em] text-(--accent-color)",
        "rounded-xl disabled:cursor-not-allowed disabled:text-(--btn-disabled-color)",
        quiet ? "bg-inherit" : "bg-(--bg-color-secondary)",
        className
      )}
      {...props}
    />
  );
}
