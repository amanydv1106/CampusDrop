import type { ReactNode } from "react";
import { AppButton } from "./AppButton";

type DialogShellProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  hideDefaultClose?: boolean;
};

export function DialogShell({
  title,
  children,
  onClose,
  hideDefaultClose = false
}: DialogShellProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex animate-[fade-in_180ms_both] items-center justify-center bg-black/30 p-4.5"
      role="dialog"
      aria-modal="true"
    >
      <section className="max-h-[calc(100dvh-28px)] w-[min(440px,calc(100vw-28px))] overflow-auto rounded-sm bg-(--dialog-bg-color) text-[rgb(var(--text-color))] shadow-[0_4px_5px_0_rgb(0_0_0/14%),0_1px_10px_0_rgb(0_0_0/12%),0_2px_4px_-1px_rgb(0_0_0/40%)]">
        <div className="flex justify-center p-2.5">
          <h2 className="m-0 text-center text-[22px] font-normal leading-8 tracking-normal text-(--primary-color)">
            {title}
          </h2>
        </div>
        {children}
        {!hideDefaultClose && (
          <div className="flex flex-row-reverse flex-wrap justify-center gap-2 p-2.5">
            <AppButton type="button" onClick={onClose}>
              Close
            </AppButton>
          </div>
        )}
      </section>
    </div>
  );
}
