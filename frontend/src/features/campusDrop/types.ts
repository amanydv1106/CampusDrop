export type DialogType =
  | "pair"
  | "room"
  | "language"
  | "about"
  | "receive-file"
  | "send-message"
  | "receive-message"
  | null;

export type ThemeMode = "auto" | "light" | "dark";

export interface DeviceInfo {
  type: "desktop" | "mobile" | "tablet";
  os: string;
  browser?: string;
}

export interface Peer {
  peerId: string;
  name: string;
  device: DeviceInfo;
  paired?: boolean;
  room?: boolean;
}

export interface TransferProgress {
  transferId: string;
  peerId: string;
  peerName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  progress: number; // 0 to 100
  bytesTransferred: number;
  speed: string;
  direction: "send" | "receive";
  status: "pending" | "transferring" | "completed" | "cancelled" | "error";
  blob?: Blob;
  downloadUrl?: string;
  error?: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}
