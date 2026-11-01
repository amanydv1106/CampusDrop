"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { DialogType, DirectMessage, Peer, ThemeMode, TransferProgress } from "../types";
import { ActiveDialog } from "./dialogs/ActiveDialog";
import { AppHeader } from "./header/AppHeader";
import { AppFooter } from "./layout/AppFooter";
import { CenterStage } from "./layout/CenterStage";
import { RadarCanvas } from "./layout/RadarCanvas";
import { SignalingClient } from "../services/signaling";
import { TransferManager } from "../services/transferManager";
import { getDeviceInfo } from "../utils/device";
import { sounds } from "../utils/audio";
import { generateUUID } from "../utils/uuid";

export function CampusDropApp() {
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [theme, setTheme] = useState<ThemeMode>("auto");
  const [deviceName, setDeviceName] = useState<string>("Aqua Falcon");
  const [peers, setPeers] = useState<Peer[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<Peer | null>(null);

  // Room state
  const [roomId, setRoomId] = useState<string>(() => {
    // Generate default 5-character uppercase alphanumeric code
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  });
  const [isCurrentlyInRoom, setIsCurrentlyInRoom] = useState(false);

  // Pair state
  const [pairKey, setPairKey] = useState<string>("000 000");
  const [isPairing, setIsPairing] = useState(false);
  const [pairError, setPairError] = useState<string | null>(null);
  const [pairedSecrets, setPairedSecrets] = useState<string[]>([]);
  const [pairedDevices, setPairedDevices] = useState<Array<{ id: string; name: string }>>([]);

  // Transfer & Message states
  const [activeTransfers, setActiveTransfers] = useState<Map<string, TransferProgress>>(new Map());
  const [currentPromptTransfer, setCurrentPromptTransfer] = useState<TransferProgress | null>(null);
  const [receivedMessage, setReceivedMessage] = useState<DirectMessage | null>(null);

  // Persistent instances
  const signalingRef = useRef<SignalingClient | null>(null);
  const transferMgrRef = useRef<TransferManager | null>(null);
  const peerIdRef = useRef<string>("");

  // Initialize client UUID, stored name, theme, and paired secrets from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    // UUID
    let pId = localStorage.getItem("campusdrop_peer_id");
    if (!pId) {
      pId = generateUUID();
      localStorage.setItem("campusdrop_peer_id", pId);
    }
    peerIdRef.current = pId;

    // Device Name
    const savedName = localStorage.getItem("campusdrop_device_name");
    if (savedName) {
      setDeviceName(savedName);
    }

    // Theme
    const savedTheme = localStorage.getItem("campusdrop_theme") as ThemeMode | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // Paired secrets
    try {
      const savedSecrets = JSON.parse(localStorage.getItem("campusdrop_paired_secrets") || "[]");
      if (Array.isArray(savedSecrets)) setPairedSecrets(savedSecrets);

      const savedDevs = JSON.parse(localStorage.getItem("campusdrop_paired_devices") || "[]");
      if (Array.isArray(savedDevs)) setPairedDevices(savedDevs);
    } catch {
      // Ignore
    }

    // Register PWA Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").catch(() => {});
    }

    // Request desktop notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    // Auto-join room from URL search parameters (?room=XYZ) or hash (#XYZ)
    const searchParams = new URLSearchParams(window.location.search);
    const queryRoom = searchParams.get("room") || window.location.hash.replace(/^#/, "").trim();
    if (queryRoom && queryRoom.length === 5) {
      setRoomId(queryRoom.toUpperCase());
      setIsCurrentlyInRoom(true);
    }
  }, []);

  // Save theme changes
  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("campusdrop_theme", newTheme);
    }
  };

  // Setup WebSocket Signaling and WebRTC Transfer Manager
  useEffect(() => {
    const signaling = new SignalingClient();
    const transferMgr = new TransferManager(signaling);

    signalingRef.current = signaling;
    transferMgrRef.current = transferMgr;

    // Setup TransferManager Callbacks
    transferMgr.onIncomingPrompt = (info) => {
      const promptTransfer: TransferProgress = {
        transferId: info.transferId,
        peerId: info.peerId,
        peerName: peers.find((p) => p.peerId === info.peerId)?.name || "Unknown Peer",
        fileName: info.name,
        fileSize: info.size,
        mimeType: info.mimeType,
        progress: 0,
        bytesTransferred: 0,
        speed: "0 KB/s",
        direction: "receive",
        status: "pending"
      };

      setCurrentPromptTransfer(promptTransfer);
      setActiveDialog("receive-file");

      // Trigger desktop notification if tab is in background
      if (typeof document !== "undefined" && document.hidden && "Notification" in window && Notification.permission === "granted") {
        new Notification("Campus Drop — Incoming File", {
          body: `${info.name} from nearby peer`,
          icon: "/icon.svg"
        });
      }
    };

    transferMgr.onTransferProgress = (info) => {
      setActiveTransfers((prev) => {
        const next = new Map(prev);
        const existing = next.get(info.transferId);
        const peer = peers.find((p) => p.peerId === info.peerId);

        next.set(info.transferId, {
          transferId: info.transferId,
          peerId: info.peerId,
          peerName: existing?.peerName || peer?.name || "Peer",
          fileName: existing?.fileName || "file",
          fileSize: existing?.fileSize || 0,
          mimeType: existing?.mimeType || "application/octet-stream",
          progress: info.progress,
          bytesTransferred: 0,
          speed: "",
          direction: info.direction,
          status: info.status,
          blob: info.blob,
          downloadUrl: info.downloadUrl,
          error: info.error
        });
        return next;
      });

      if (info.status === "completed" || info.status === "error" || info.status === "cancelled") {
        if (info.status === "completed" && typeof document !== "undefined" && document.hidden && "Notification" in window && Notification.permission === "granted") {
          new Notification("Campus Drop — Transfer Complete", {
            body: `File received successfully`,
            icon: "/icon.svg"
          });
        }

        setCurrentPromptTransfer((curr) => {
          if (curr && curr.transferId === info.transferId) {
            return {
              ...curr,
              progress: info.progress,
              status: info.status,
              blob: info.blob,
              downloadUrl: info.downloadUrl,
              error: info.error
            };
          }
          return curr;
        });
      }
    };

    transferMgr.onDirectMessage = (info) => {
      const sender = peers.find((p) => p.peerId === info.senderId);
      setReceivedMessage({
        id: generateUUID(),
        senderId: info.senderId,
        senderName: sender?.name || "Peer",
        text: info.text,
        timestamp: info.timestamp
      });
      setActiveDialog("receive-message");
    };

    // Signaling events
    signaling.on("open", () => {
      const deviceInfo = getDeviceInfo();
      const pId = peerIdRef.current || generateUUID();
      transferMgr.setSelfPeerId(pId);

      signaling.send({
        type: "join",
        peerId: pId,
        name: deviceName,
        device: deviceInfo,
        pairedSecrets,
        roomId: isCurrentlyInRoom ? roomId : null
      });
    });

    signaling.on("welcome", (msg: { self: any; peers: Peer[] }) => {
      if (msg.self?.name && !localStorage.getItem("campusdrop_device_name")) {
        setDeviceName(msg.self.name);
      }
      setPeers(msg.peers || []);
    });

    signaling.on("peers", (msg: { peers: Peer[] }) => {
      setPeers(msg.peers || []);
    });

    signaling.on("peer-joined", (msg: { peer: Peer }) => {
      sounds.playJoin();
      setPeers((prev) => {
        const filtered = prev.filter((p) => p.peerId !== msg.peer.peerId);
        return [...filtered, msg.peer];
      });
    });

    signaling.on("peer-updated", (msg: { peer: { peerId: string; name: string } }) => {
      setPeers((prev) =>
        prev.map((p) => (p.peerId === msg.peer.peerId ? { ...p, name: msg.peer.name } : p))
      );
    });

    signaling.on("peer-left", (msg: { peerId: string }) => {
      setPeers((prev) => prev.filter((p) => p.peerId !== msg.peerId));
    });

    signaling.on("room-joined", (msg: { roomId: string; peers: Peer[] }) => {
      setRoomId(msg.roomId);
      setIsCurrentlyInRoom(true);
      setPeers(msg.peers || []);
    });

    signaling.on("room-left", (msg: { peers: Peer[] }) => {
      setIsCurrentlyInRoom(false);
      setPeers(msg.peers || []);
    });

    signaling.on("pair-key-generated", (msg: { pairKey: string }) => {
      setPairKey(msg.pairKey);
    });

    signaling.on("pair-success", (msg: { pairingSecret: string; peer: Peer }) => {
      sounds.playComplete();
      setIsPairing(false);
      setPairError(null);

      // Add to paired secrets
      setPairedSecrets((prev) => {
        const updated = Array.from(new Set([...prev, msg.pairingSecret]));
        localStorage.setItem("campusdrop_paired_secrets", JSON.stringify(updated));
        return updated;
      });

      // Add to paired devices
      setPairedDevices((prev) => {
        const filtered = prev.filter((d) => d.id !== msg.pairingSecret);
        const updated = [...filtered, { id: msg.pairingSecret, name: msg.peer.name }];
        localStorage.setItem("campusdrop_paired_devices", JSON.stringify(updated));
        return updated;
      });

      // Update peer in current list to be marked as paired
      setPeers((prev) =>
        prev.map((p) => (p.peerId === msg.peer.peerId ? { ...p, paired: true } : p))
      );

      setActiveDialog(null);
    });

    signaling.on("pair-error", (msg: { message: string }) => {
      sounds.playError();
      setIsPairing(false);
      setPairError(msg.message || "Failed to pair devices.");
    });

    // Start connection
    signaling.connect();

    return () => {
      signaling.disconnect();
    };
  }, []);

  // Update name to server and localStorage
  const handleDeviceNameChange = (name: string) => {
    setDeviceName(name);
    if (typeof window !== "undefined") {
      localStorage.setItem("campusdrop_device_name", name);
    }
    signalingRef.current?.send({
      type: "update-name",
      name
    });
  };

  // Pair Dialog Handlers
  const handleOpenPairDialog = () => {
    setPairError(null);
    setActiveDialog("pair");
    signalingRef.current?.send({ type: "request-pair-key" });
  };

  const handlePairSubmit = (key: string) => {
    setIsPairing(true);
    setPairError(null);
    signalingRef.current?.send({
      type: "submit-pair-key",
      pairKey: key
    });
  };

  const handleUnpair = (secretId: string) => {
    setPairedSecrets((prev) => {
      const updated = prev.filter((s) => s !== secretId);
      localStorage.setItem("campusdrop_paired_secrets", JSON.stringify(updated));
      return updated;
    });
    setPairedDevices((prev) => {
      const updated = prev.filter((d) => d.id !== secretId);
      localStorage.setItem("campusdrop_paired_devices", JSON.stringify(updated));
      return updated;
    });
  };

  // Public Room Handlers
  const handleJoinRoom = (code: string) => {
    signalingRef.current?.send({
      type: "join-room",
      roomId: code
    });
  };

  const handleLeaveRoom = () => {
    signalingRef.current?.send({
      type: "leave-room"
    });
  };

  // Transfer Handlers
  const handleSendFile = async (peer: Peer, file: File) => {
    if (!transferMgrRef.current) return;
    const transferId = generateUUID();

    // Register active transfer
    setActiveTransfers((prev) => {
      const next = new Map(prev);
      next.set(transferId, {
        transferId,
        peerId: peer.peerId,
        peerName: peer.name,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
        progress: 0,
        bytesTransferred: 0,
        speed: "0 KB/s",
        direction: "send",
        status: "pending"
      });
      return next;
    });

    await transferMgrRef.current.sendFile(peer.peerId, file, transferId);
  };

  const handleAcceptTransfer = (transferId: string) => {
    transferMgrRef.current?.acceptTransfer(transferId, true);
    if (currentPromptTransfer) {
      setCurrentPromptTransfer({
        ...currentPromptTransfer,
        status: "transferring"
      });
    }
  };

  const handleDeclineTransfer = (transferId: string) => {
    transferMgrRef.current?.acceptTransfer(transferId, false);
    setActiveDialog(null);
    setCurrentPromptTransfer(null);
  };

  // Message Handlers
  const handleOpenSendMessage = (peer: Peer) => {
    setSelectedPeer(peer);
    setActiveDialog("send-message");
  };

  const handleSendMessage = (peer: Peer, text: string) => {
    transferMgrRef.current?.sendMessage(peer.peerId, text);
  };

  const themeClassName = theme === "auto" ? "" : `${theme}-theme`;

  return (
    <main
      className={cn(
        "campusdrop-shell relative flex min-h-dvh w-screen flex-col overflow-hidden",
        themeClassName
      )}
    >
      {/* Animated Radar Pulse Canvas */}
      <RadarCanvas theme={theme} isDiscovering={peers.length === 0} />

      {/* Top Header Bar */}
      <AppHeader
        theme={theme}
        onThemeChange={handleThemeChange}
        onDialogChange={(dialog) => {
          if (dialog === "pair") {
            handleOpenPairDialog();
          } else {
            setActiveDialog(dialog);
          }
        }}
      />

      {/* Center Stage & Peer Nodes */}
      <CenterStage
        peers={peers}
        activeTransfers={activeTransfers}
        onSendFile={handleSendFile}
        onSendMessage={handleOpenSendMessage}
      />

      {/* Footer Bar */}
      <AppFooter
        deviceName={deviceName}
        roomId={roomId}
        isRoomVisible={isCurrentlyInRoom}
        onDeviceNameChange={handleDeviceNameChange}
        onRoomClick={() => {
          setActiveDialog("room");
        }}
      />

      {/* Modals & Dialogs */}
      <ActiveDialog
        activeDialog={activeDialog}
        pairKey={pairKey}
        roomId={roomId}
        isCurrentlyInRoom={isCurrentlyInRoom}
        selectedPeer={selectedPeer}
        activeTransfer={currentPromptTransfer}
        receivedMessage={receivedMessage}
        pairedDevices={pairedDevices}
        onPair={handlePairSubmit}
        onUnpair={handleUnpair}
        onJoinRoom={handleJoinRoom}
        onLeaveRoom={handleLeaveRoom}
        onAcceptTransfer={handleAcceptTransfer}
        onDeclineTransfer={handleDeclineTransfer}
        onSendMessage={handleSendMessage}
        onClose={() => {
          setActiveDialog(null);
          setCurrentPromptTransfer(null);
          setReceivedMessage(null);
        }}
      />
    </main>
  );
}
