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
        <div className="flex flex-col items-center justify-center p-6 text-center mx-auto my-auto max-w-lg z-10 animate-[fade-in_600ms_both]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-(--primary-color)/10 text-(--primary-color)">
            <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current" aria-hidden="true">
              <path d="M12 18.2a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8zm-6.4-6.4 1.7 1.7a6.7 6.7 0 0 1 9.4 0l1.7-1.7a9.1 9.1 0 0 0-12.8 0zM2 8.2l1.7 1.7a11.8 11.8 0 0 1 16.6 0L22 8.2a14.2 14.2 0 0 0-20 0z" />
            </svg>
          </div>
          <h2 className="m-0 mb-2 text-2xl font-bold tracking-tight text-(--primary-color) max-[560px]:text-xl">
            Open Campus Drop on other devices to send files
          </h2>
          <p className="m-0 text-sm opacity-80 max-w-md leading-relaxed">
            Pair devices or enter a public room to be discoverable across campus networks
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
