import { SignalingClient } from "./signaling";
import { sounds } from "../utils/audio";
import { generateUUID } from "../utils/uuid";

const CHUNK_SIZE = 64 * 1024; // 64 KB
const BUFFER_THRESHOLD = 512 * 1024; // 512 KB backpressure threshold

export interface TransferHeader {
  type: "header";
  transferId: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface HeaderAck {
  type: "header-ack";
  transferId: string;
  accepted: boolean;
}

export interface TransferComplete {
  type: "complete";
  transferId: string;
}

export interface TextMessagePayload {
  type: "text-message";
  text: string;
  timestamp: number;
}

export type TransferMessage =
  | TransferHeader
  | HeaderAck
  | TransferComplete
  | TextMessagePayload;

export class TransferManager {
  private signaling: SignalingClient;
  private selfPeerId: string = "";
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private dataChannels: Map<string, RTCDataChannel> = new Map();

  // Active incoming transfers: transferId -> { meta, chunks, receivedBytes }
  private incomingTransfers: Map<
    string,
    {
      transferId: string;
      peerId: string;
      name: string;
      size: number;
      mimeType: string;
      chunks: ArrayBuffer[];
      receivedBytes: number;
    }
  > = new Map();

  // Callbacks
  public onIncomingPrompt?: (info: {
    transferId: string;
    peerId: string;
    name: string;
    size: number;
    mimeType: string;
  }) => void;

  public onTransferProgress?: (info: {
    transferId: string;
    peerId: string;
    progress: number;
    direction: "send" | "receive";
    status: "pending" | "transferring" | "completed" | "cancelled" | "error";
    error?: string;
    blob?: Blob;
    downloadUrl?: string;
  }) => void;

  public onDirectMessage?: (info: {
    senderId: string;
    text: string;
    timestamp: number;
  }) => void;

  private pendingAcks: Map<string, (accepted: boolean) => void> = new Map();

  constructor(signaling: SignalingClient) {
    this.signaling = signaling;
    this.setupSignalingListeners();
  }

  setSelfPeerId(id: string) {
    this.selfPeerId = id;
  }

  private setupSignalingListeners() {
    this.signaling.on("signal", async (msg: { senderId: string; data: any }) => {
      const { senderId, data } = msg;
      await this.handleSignalingData(senderId, data);
    });

    this.signaling.on("relay-transfer", (msg: { senderId: string; payload: any }) => {
      // Handles fallback message via WebSocket server
      this.handleReceivedPayload(msg.senderId, msg.payload);
    });
  }

  private createPeerConnection(peerId: string): RTCPeerConnection {
    if (this.peerConnections.has(peerId)) {
      return this.peerConnections.get(peerId)!;
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.signaling.send({
          type: "signal",
          recipientId: peerId,
          data: { candidate: event.candidate }
        });
      }
    };

    pc.ondatachannel = (event) => {
      this.setupDataChannel(peerId, event.channel);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        this.closePeer(peerId);
      }
    };

    this.peerConnections.set(peerId, pc);
    return pc;
  }

  private setupDataChannel(peerId: string, channel: RTCDataChannel) {
    channel.binaryType = "arraybuffer";

    channel.onopen = () => {
      this.dataChannels.set(peerId, channel);
    };

    channel.onclose = () => {
      this.dataChannels.delete(peerId);
    };

    channel.onmessage = (event) => {
      this.handleReceivedPayload(peerId, event.data);
    };

    this.dataChannels.set(peerId, channel);
  }

  private async getOrCreateDataChannel(peerId: string): Promise<RTCDataChannel | null> {
    const existing = this.dataChannels.get(peerId);
    if (existing && existing.readyState === "open") {
      return existing;
    }

    try {
      const pc = this.createPeerConnection(peerId);
      const channel = pc.createDataChannel("campusdrop-data", { ordered: true });
      this.setupDataChannel(peerId, channel);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      this.signaling.send({
        type: "signal",
        recipientId: peerId,
        data: { sdp: offer }
      });

      // Wait up to 3.5 seconds for channel to open
      return await new Promise<RTCDataChannel | null>((resolve) => {
        const timeout = setTimeout(() => {
          resolve(null); // Fallback to WebSocket relay if timeout
        }, 3500);

        channel.onopen = () => {
          clearTimeout(timeout);
          resolve(channel);
        };
      });
    } catch {
      return null;
    }
  }

  private async handleSignalingData(senderId: string, data: any) {
    const pc = this.createPeerConnection(senderId);

    if (data.sdp) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

      if (data.sdp.type === "offer") {
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        this.signaling.send({
          type: "signal",
          recipientId: senderId,
          data: { sdp: answer }
        });
      }
    } else if (data.candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (err) {
        console.error("[WebRTC ICE error]", err);
      }
    }
  }

  private handleReceivedPayload(senderId: string, data: any) {
    if (data instanceof ArrayBuffer) {
      // Binary chunk received!
      // Add chunk to current active incoming transfer for this sender
      for (const [tId, transfer] of this.incomingTransfers.entries()) {
        if (transfer.peerId === senderId && transfer.receivedBytes < transfer.size) {
          transfer.chunks.push(data);
          transfer.receivedBytes += data.byteLength;

          const progress = Math.min(100, Math.round((transfer.receivedBytes / transfer.size) * 100));

          this.onTransferProgress?.({
            transferId: tId,
            peerId: senderId,
            progress,
            direction: "receive",
            status: "transferring"
          });
          break;
        }
      }
      return;
    }

    // JSON control message
    let msg: TransferMessage;
    try {
      msg = typeof data === "string" ? JSON.parse(data) : data;
    } catch {
      return;
    }

    switch (msg.type) {
      case "header": {
        sounds.playNotify();
        this.incomingTransfers.set(msg.transferId, {
          transferId: msg.transferId,
          peerId: senderId,
          name: msg.name,
          size: msg.size,
          mimeType: msg.mimeType,
          chunks: [],
          receivedBytes: 0
        });

        this.onIncomingPrompt?.({
          transferId: msg.transferId,
          peerId: senderId,
          name: msg.name,
          size: msg.size,
          mimeType: msg.mimeType
        });
        break;
      }

      case "header-ack": {
        const resolver = this.pendingAcks.get(msg.transferId);
        if (resolver) {
          resolver(msg.accepted);
          this.pendingAcks.delete(msg.transferId);
        }
        break;
      }

      case "complete": {
        const transfer = this.incomingTransfers.get(msg.transferId);
        if (transfer) {
          const blob = new Blob(transfer.chunks, { type: transfer.mimeType || "application/octet-stream" });
          const downloadUrl = URL.createObjectURL(blob);

          sounds.playComplete();

          this.onTransferProgress?.({
            transferId: msg.transferId,
            peerId: senderId,
            progress: 100,
            direction: "receive",
            status: "completed",
            blob,
            downloadUrl
          });

          // Automatically trigger download
          this.triggerDownload(downloadUrl, transfer.name);
          this.incomingTransfers.delete(msg.transferId);
        }
        break;
      }

      case "text-message": {
        sounds.playNotify();
        this.onDirectMessage?.({
          senderId,
          text: msg.text,
          timestamp: msg.timestamp
        });
        break;
      }
    }
  }

  public acceptTransfer(transferId: string, accepted: boolean) {
    const transfer = this.incomingTransfers.get(transferId);
    if (!transfer) return;

    this.sendControlMessage(transfer.peerId, {
      type: "header-ack",
      transferId,
      accepted
    });

    if (!accepted) {
      this.incomingTransfers.delete(transferId);
      this.onTransferProgress?.({
        transferId,
        peerId: transfer.peerId,
        progress: 0,
        direction: "receive",
        status: "cancelled"
      });
    }
  }

  private sendControlMessage(peerId: string, message: TransferMessage) {
    const channel = this.dataChannels.get(peerId);
    if (channel && channel.readyState === "open") {
      channel.send(JSON.stringify(message));
    } else {
      // Fallback via WebSocket
      this.signaling.send({
        type: "relay-transfer",
        recipientId: peerId,
        payload: message
      });
    }
  }

  private sendRawChunk(peerId: string, chunk: ArrayBuffer) {
    const channel = this.dataChannels.get(peerId);
    if (channel && channel.readyState === "open") {
      channel.send(chunk);
    } else {
      // WebSocket fallback
      this.signaling.send({
        type: "relay-transfer",
        recipientId: peerId,
        payload: chunk
      });
    }
  }

  public async sendFile(peerId: string, file: File, transferId = generateUUID()): Promise<boolean> {
    // 1. Establish RTC Data Channel or prepare fallback
    const channel = await this.getOrCreateDataChannel(peerId);

    // 2. Send transfer header
    this.sendControlMessage(peerId, {
      type: "header",
      transferId,
      name: file.name,
      size: file.size,
      mimeType: file.type || "application/octet-stream"
    });

    this.onTransferProgress?.({
      transferId,
      peerId,
      progress: 0,
      direction: "send",
      status: "pending"
    });

    // 3. Wait for peer acceptance ACK
    const accepted = await new Promise<boolean>((resolve) => {
      this.pendingAcks.set(transferId, resolve);
      // Timeout after 60s
      setTimeout(() => {
        if (this.pendingAcks.has(transferId)) {
          this.pendingAcks.delete(transferId);
          resolve(false);
        }
      }, 60000);
    });

    if (!accepted) {
      sounds.playError();
      this.onTransferProgress?.({
        transferId,
        peerId,
        progress: 0,
        direction: "send",
        status: "cancelled",
        error: "Transfer declined by recipient"
      });
      return false;
    }

    // 4. Stream chunks with backpressure
    let offset = 0;
    const totalSize = file.size;

    while (offset < totalSize) {
      const slice = file.slice(offset, offset + CHUNK_SIZE);
      const buffer = await slice.arrayBuffer();

      // Backpressure check on WebRTC channel
      if (channel && channel.readyState === "open") {
        if (channel.bufferedAmount > BUFFER_THRESHOLD) {
          await new Promise<void>((resolve) => {
            channel.bufferedAmountLowThreshold = BUFFER_THRESHOLD / 2;
            channel.onbufferedamountlow = () => {
              channel.onbufferedamountlow = null;
              resolve();
            };
          });
        }
      }

      this.sendRawChunk(peerId, buffer);
      offset += buffer.byteLength;

      const progress = Math.min(100, Math.round((offset / totalSize) * 100));
      this.onTransferProgress?.({
        transferId,
        peerId,
        progress,
        direction: "send",
        status: "transferring"
      });
    }

    // 5. Send complete signal
    this.sendControlMessage(peerId, {
      type: "complete",
      transferId
    });

    sounds.playComplete();

    this.onTransferProgress?.({
      transferId,
      peerId,
      progress: 100,
      direction: "send",
      status: "completed"
    });

    return true;
  }

  public sendMessage(peerId: string, text: string) {
    this.sendControlMessage(peerId, {
      type: "text-message",
      text,
      timestamp: Date.now()
    });
  }

  private triggerDownload(url: string, filename: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);
  }

  private closePeer(peerId: string) {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(peerId);
    }
    this.dataChannels.delete(peerId);
  }
}
