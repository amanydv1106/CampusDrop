"use client";

import type { DialogType, Peer, TransferProgress, DirectMessage } from "../../types";
import { AboutDialog } from "./AboutDialog";
import { LanguageDialog } from "./LanguageDialog";
import { PairDeviceDialog } from "./PairDeviceDialog";
import { PublicRoomDialog } from "./PublicRoomDialog";
import { ReceiveFileDialog } from "./ReceiveFileDialog";
import { SendMessageDialog } from "./SendMessageDialog";
import { ReceiveMessageDialog } from "./ReceiveMessageDialog";

interface ActiveDialogProps {
  activeDialog: DialogType;
  pairKey: string;
  roomId: string;
  isCurrentlyInRoom?: boolean;
  selectedPeer: Peer | null;
  activeTransfer: TransferProgress | null;
  receivedMessage: DirectMessage | null;
  pairedDevices?: Array<{ id: string; name: string }>;
  onPair: (key: string) => void;
  onUnpair?: (id: string) => void;
  onJoinRoom: (roomId: string) => void;
  onLeaveRoom: () => void;
  onAcceptTransfer: (transferId: string) => void;
  onDeclineTransfer: (transferId: string) => void;
  onSendMessage: (peer: Peer, text: string) => void;
  onClose: () => void;
}

export function ActiveDialog({
  activeDialog,
  pairKey,
  roomId,
  isCurrentlyInRoom = false,
  selectedPeer,
  activeTransfer,
  receivedMessage,
  pairedDevices = [],
  onPair,
  onUnpair,
  onJoinRoom,
  onLeaveRoom,
  onAcceptTransfer,
  onDeclineTransfer,
  onSendMessage,
  onClose
}: ActiveDialogProps) {
  switch (activeDialog) {
    case "pair":
      return (
        <PairDeviceDialog
          pairKey={pairKey}
          pairedDevices={pairedDevices}
          onPair={onPair}
          onUnpair={onUnpair}
          onClose={onClose}
        />
      );
    case "room":
      return (
        <PublicRoomDialog
          roomId={roomId}
          isCurrentlyInRoom={isCurrentlyInRoom}
          onJoinRoom={onJoinRoom}
          onLeaveRoom={onLeaveRoom}
          onClose={onClose}
        />
      );
    case "language":
      return <LanguageDialog onClose={onClose} />;
    case "about":
      return <AboutDialog onClose={onClose} />;
    case "receive-file":
      return (
        <ReceiveFileDialog
          transfer={activeTransfer}
          onAccept={onAcceptTransfer}
          onDecline={onDeclineTransfer}
          onClose={onClose}
        />
      );
    case "send-message":
      return (
        <SendMessageDialog
          peer={selectedPeer}
          onSend={onSendMessage}
          onClose={onClose}
        />
      );
    case "receive-message":
      return (
        <ReceiveMessageDialog
          message={receivedMessage}
          onClose={onClose}
        />
      );
    default:
      return null;
  }
}
