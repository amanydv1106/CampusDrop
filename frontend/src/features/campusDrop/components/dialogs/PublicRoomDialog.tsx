"use client";

import { useState } from "react";
import { AppButton } from "../ui/AppButton";
import { DialogShell } from "../ui/DialogShell";
import { KeyInputs } from "../ui/KeyInputs";
import { EntrySection, KeySection, OrDivider } from "./DialogBlocks";

interface PublicRoomDialogProps {
  roomId: string;
  isCurrentlyInRoom?: boolean;
  onJoinRoom: (roomId: string) => void;
  onLeaveRoom: () => void;
  onClose: () => void;
}

export function PublicRoomDialog({
  roomId,
  isCurrentlyInRoom = false,
  onJoinRoom,
  onLeaveRoom,
  onClose
}: PublicRoomDialogProps) {
  const [inputRoomId, setInputRoomId] = useState("");

  const handleJoin = () => {
    if (inputRoomId.length === 5) {
      onJoinRoom(inputRoomId);
      onClose();
    }
  };

  return (
    <DialogShell title="Temporary Public Room" onClose={onClose} hideDefaultClose>
      <KeySection
        code={roomId}
        description="Input this room ID on another device or scan the QR-code."
        qrTone="amber"
      />

      <OrDivider />

      <EntrySection description="Enter 5-character room ID from another device to join room.">
        <KeyInputs count={5} value={inputRoomId} onChange={setInputRoomId} allowAlpha />
      </EntrySection>

      <div className="flex flex-wrap justify-start gap-2 p-2.5">
        <AppButton
          disabled={inputRoomId.length !== 5}
          type="button"
          onClick={handleJoin}
        >
          Join
        </AppButton>
        {isCurrentlyInRoom && (
          <AppButton
            type="button"
            onClick={() => {
              onLeaveRoom();
              onClose();
            }}
          >
            Leave Room
          </AppButton>
        )}
        <AppButton type="button" onClick={onClose}>
          Close
        </AppButton>
      </div>
    </DialogShell>
  );
}
