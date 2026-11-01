"use client";

import { useState } from "react";
import { AppButton } from "../ui/AppButton";
import { DialogShell } from "../ui/DialogShell";
import { KeyInputs } from "../ui/KeyInputs";
import { EntrySection, KeySection, OrDivider } from "./DialogBlocks";

interface PairDeviceDialogProps {
  pairKey: string;
  isPairing?: boolean;
  pairError?: string | null;
  pairedDevices?: Array<{ id: string; name: string }>;
  onPair: (key: string) => void;
  onUnpair?: (id: string) => void;
  onClose: () => void;
}

export function PairDeviceDialog({
  pairKey,
  isPairing = false,
  pairError = null,
  pairedDevices = [],
  onPair,
  onUnpair,
  onClose
}: PairDeviceDialogProps) {
  const [inputKey, setInputKey] = useState("");

  const formattedKey = pairKey.length === 6 ? `${pairKey.slice(0, 3)} ${pairKey.slice(3)}` : pairKey;

  const handleSubmit = () => {
    if (inputKey.length === 6) {
      onPair(inputKey);
    }
  };

  return (
    <DialogShell title="Pair Devices Permanently" onClose={onClose} hideDefaultClose>
      <KeySection
        code={formattedKey}
        description="Input this key on another device or scan the QR-code."
      />

      <OrDivider />

      <EntrySection description="Enter key from another device here.">
        <KeyInputs count={6} value={inputKey} onChange={setInputKey} />
        {pairError && <div className="mt-2 text-center text-xs text-red-500">{pairError}</div>}
      </EntrySection>

      {pairedDevices.length > 0 && (
        <div className="border-t border-(--border-color)/20 px-4 py-3">
          <div className="text-xs font-semibold opacity-70 mb-2">Paired Devices:</div>
          <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
            {pairedDevices.map((dev) => (
              <div key={dev.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-(--border-color)/10">
                <span>{dev.name}</span>
                {onUnpair && (
                  <button
                    type="button"
                    onClick={() => onUnpair(dev.id)}
                    className="text-red-500 hover:underline"
                  >
                    Unpair
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-start gap-2 p-2.5">
        <AppButton
          disabled={inputKey.length !== 6 || isPairing}
          type="button"
          onClick={handleSubmit}
        >
          {isPairing ? "Pairing..." : "Pair"}
        </AppButton>
        <AppButton type="button" onClick={onClose}>
          Cancel
        </AppButton>
      </div>
    </DialogShell>
  );
}
