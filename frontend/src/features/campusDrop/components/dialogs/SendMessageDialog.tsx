"use client";

import { useState } from "react";
import { DialogShell } from "../ui/DialogShell";
import { AppButton } from "../ui/AppButton";
import type { Peer } from "../../types";

interface SendMessageDialogProps {
  peer: Peer | null;
  onSend: (peer: Peer, text: string) => void;
  onClose: () => void;
}

export function SendMessageDialog({ peer, onSend, onClose }: SendMessageDialogProps) {
  const [text, setText] = useState("");

  if (!peer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(peer, text.trim());
      onClose();
    }
  };

  return (
    <DialogShell title="Send Message" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col p-4">
        <label className="text-xs opacity-75 mb-1.5">
          Send instant text or clipboard note to:{" "}
          <strong className="text-(--primary-color)">{peer.name}</strong>
        </label>
        <textarea
          autoFocus
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your message here..."
          className="w-full resize-none rounded-xl border border-(--border-color)/40 bg-[rgb(var(--bg-color-secondary))] p-3 text-sm outline-none focus:border-(--primary-color)"
        />
        <div className="mt-3 flex justify-end gap-2">
          <AppButton type="button" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" disabled={!text.trim()}>
            Send Message
          </AppButton>
        </div>
      </form>
    </DialogShell>
  );
}
