"use client";

import { useRef } from "react";

interface KeyInputsProps {
  count: number;
  value: string;
  onChange: (val: string) => void;
  allowAlpha?: boolean;
}

export function KeyInputs({ count, value, onChange, allowAlpha = false }: KeyInputsProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const characters = Array.from({ length: count }, (_, i) => value[i] || "");

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!characters[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    let char = e.target.value.slice(-1);
    if (!char) {
      // Deleted
      const newChars = [...characters];
      newChars[index] = "";
      onChange(newChars.join(""));
      return;
    }

    if (allowAlpha) {
      char = char.toUpperCase();
      if (!/^[A-Z0-9]$/.test(char)) return;
    } else {
      if (!/^[0-9]$/.test(char)) return;
    }

    const newChars = [...characters];
    newChars[index] = char;
    const newVal = newChars.join("");
    onChange(newVal);

    // Auto-advance focus
    if (index < count - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    let cleaned = allowAlpha ? pasted.toUpperCase().replace(/[^A-Z0-9]/g, "") : pasted.replace(/[^0-9]/g, "");
    cleaned = cleaned.slice(0, count);
    onChange(cleaned);

    const nextIndex = Math.min(cleaned.length, count - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex justify-center gap-1.5" dir="ltr" onPaste={handlePaste}>
      {characters.map((char, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          className="h-10.5 w-9.5 border-0 border-b-2 border-solid border-b-(--primary-color) bg-transparent text-center text-[28px] font-mono text-[rgb(var(--text-color))] outline-none transition-colors focus:border-b-4 max-[560px]:w-8"
          aria-label={`key character ${index + 1}`}
          maxLength={1}
          value={char}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
        />
      ))}
    </div>
  );
}
