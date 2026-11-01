"use client";

import { useState, type ReactNode } from "react";

type KeySectionProps = {
  code: string;
  description: string;
  qrTone?: "primary" | "amber";
};

export function KeySection({ code, description, qrTone = "primary" }: KeySectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof window !== "undefined") {
        const url = `${window.location.origin}/#${code.replace(/\s+/g, "")}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Ignore
    }
  };

  return (
    <div className="flex flex-col items-center p-2.5 text-center">
      <div
        className={`qr-box cursor-pointer transition-transform hover:scale-105 active:scale-95 ${qrTone === "amber" ? "amber" : ""}`}
        onClick={handleCopy}
        title={
          qrTone === "amber"
            ? "Click to copy link to public room"
            : "Click to copy link to pair this device"
        }
      />
      {copied && (
        <span className="mt-1 text-xs font-semibold text-(--primary-color) animate-[fade-in_150ms_ease]">
          Link copied to clipboard!
        </span>
      )}
      <h1 className="mb-1 mt-1.5 text-[34px] font-mono font-normal leading-10 tracking-normal">
        {code}
      </h1>
      <p className="m-0 max-w-80 text-sm leading-4.5">{description}</p>
    </div>
  );
}

export function EntrySection({
  children,
  description
}: {
  children: ReactNode;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center p-2.5 text-center">
      {children}
      <p className="m-0 max-w-80 text-sm leading-4.5 mt-2">{description}</p>
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="relative mx-5 my-2 flex items-center justify-center">
      <hr className="w-full border-0 border-t border-solid border-t-[#ddd]" />
      <span className="absolute bg-(--dialog-bg-color) px-2.5 text-xs font-bold opacity-75">
        OR
      </span>
    </div>
  );
}
