"use client";

import { useState } from "react";
import { DialogShell } from "../ui/DialogShell";
import { AppButton } from "../ui/AppButton";
import { Icon } from "../ui/Icon";
import type { DirectMessage } from "../../types";

interface ReceiveMessageDialogProps {
  message: DirectMessage | null;
  onClose: () => void;
}

export function ReceiveMessageDialog({ message, onClose }: ReceiveMessageDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!message) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Failed to copy
    }
  };

  return (
    <DialogShell title="Message Received" onClose={onClose}>
      <div className="flex flex-col p-4">
        <div className="text-xs opacity-75 mb-2">
          From: <strong className="text-(--primary-color)">{message.senderName}</strong>
        </div>

        <div className="relative rounded-xl border border-(--border-color)/40 bg-[rgb(var(--bg-color-secondary))] p-3 text-sm select-text whitespace-pre-wrap max-h-60 overflow-y-auto">
          {message.text}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-(--primary-color) px-3 py-1.5 text-xs font-semibold text-(--primary-color) hover:bg-(--primary-color)/10 transition-colors"
          >
            <Icon name={copied ? "check" : "copy"} className="h-3.5 w-3.5 fill-current" />
            {copied ? "Copied to Clipboard!" : "Copy Text"}
          </button>

          <AppButton type="button" onClick={onClose}>
            Close
          </AppButton>
        </div>
      </div>
    </DialogShell>
  );
}
