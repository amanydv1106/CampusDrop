"use client";

import { useState } from "react";
import type { Peer, TransferProgress } from "../../types";
import { PeerNode } from "../peer/PeerNode";

interface CenterStageProps {
  peers: Peer[];
  activeTransfers: Map<string, TransferProgress>;
  onSendFile: (peer: Peer, file: File) => void;
  onSendMessage: (peer: Peer) => void;
  onDropFiles?: (files: FileList) => void;
}

export function CenterStage({
  peers,
  activeTransfers,
  onSendFile,
  onSendMessage,
  onDropFiles
}: CenterStageProps) {
  const [isWindowDragOver, setIsWindowDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsWindowDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only if leaving the section
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsWindowDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsWindowDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (peers.length === 1) {
        // Send directly to the only peer
        onSendFile(peers[0], e.dataTransfer.files[0]);
      } else if (onDropFiles) {
        onDropFiles(e.dataTransfer.files);
      }
    }
  };

  // Find active transfer progress for a peer
  const getPeerTransferProgress = (peerId: string) => {
    for (const transfer of activeTransfers.values()) {
      if (transfer.peerId === peerId && transfer.status === "transferring") {
        return transfer.progress;
      }
    }
    return undefined;
  };

  return (
    <section
      className="relative z-1 flex flex-1 flex-col items-center justify-center overflow-hidden w-full select-none"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop full screen overlay */}
      {isWindowDragOver && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-(--primary-color)/20 backdrop-blur-xs border-4 border-dashed border-(--primary-color) pointer-events-none transition-all">
          <div className="rounded-2xl bg-[rgb(var(--dialog-bg-color))] px-6 py-4 shadow-2xl text-base font-medium">
            Drop files here to send
          </div>
        </div>
      )}

      {peers.length === 0 ? (
        <div className="flex h-34.25 max-w-[min(680px,calc(100vw-32px))] flex-1 animate-[fade-in_600ms_both] flex-col items-center justify-center p-2 text-center my-auto">
          <h2 className="m-0 mb-1.25 text-[22px] font-normal leading-8 tracking-normal text-(--primary-color) max-[560px]:text-xl max-[560px]:leading-7">
            Open Campus Drop on other devices to send files
          </h2>
          <p className="m-0 opacity-80 text-sm">
            Pair devices or enter a public room to be discoverable on other networks
          </p>
        </div>
      ) : (
        <div className="relative flex flex-1 items-center justify-center w-full min-h-[380px]">
          {/* Orbital arrangement */}
          <div className="relative w-[340px] h-[340px] max-[560px]:w-[280px] max-[560px]:h-[280px] flex items-center justify-center">
            {peers.map((peer, index) => {
              const total = peers.length;
              // Angle distributed around 360 degrees, starting from top (-PI/2)
              const angle = (2 * Math.PI * index) / total - Math.PI / 2;
              // Radius
              const radius = total === 1 ? 0 : total <= 4 ? 120 : 140;
              const x = Math.round(radius * Math.cos(angle));
              const y = Math.round(radius * Math.sin(angle));

              const progress = getPeerTransferProgress(peer.peerId);

              return (
                <div
                  key={peer.peerId}
                  className="absolute transition-all duration-500 ease-out"
                  style={{
                    transform: `translate(${x}px, ${y}px)`
                  }}
                >
                  <PeerNode
                    peer={peer}
                    progress={progress}
                    isTransferring={progress !== undefined}
                    onSendFile={onSendFile}
                    onSendMessage={onSendMessage}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
