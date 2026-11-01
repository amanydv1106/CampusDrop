"use client";

import { useRef, useState } from "react";
import type { Peer } from "../../types";
import { Icon } from "../ui/Icon";
import { cn } from "@/lib/cn";

interface PeerNodeProps {
  peer: Peer;
  progress?: number; // 0-100 if transferring
  isTransferring?: boolean;
  onSendFile: (peer: Peer, file: File) => void;
  onSendMessage: (peer: Peer) => void;
}

export function PeerNode({
  peer,
  progress = 0,
  isTransferring = false,
  onSendFile,
  onSendMessage
}: PeerNodeProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const getDeviceIcon = () => {
    switch (peer.device.type) {
      case "mobile":
        return "phone";
      case "tablet":
        return "tablet";
      default:
        return "desktop";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendFile(peer, file);
      e.target.value = ""; // Reset
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onSendFile(peer, file);
    }
  };

  // SVG Progress Ring calculations
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const toneColor = peer.paired
    ? "var(--paired-device-color)"
    : peer.room
    ? "var(--public-room-color)"
    : "var(--primary-color)";

  return (
    <div
      className="relative flex flex-col items-center group cursor-pointer select-none"
      onContextMenu={(e) => {
        e.preventDefault();
        setShowMenu(true);
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Circular Node Button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 shadow-md",
          "focus:outline-none focus:ring-4 focus:ring-(--primary-color)/40",
          isDragOver ? "scale-110 shadow-xl" : "hover:scale-105"
        )}
        style={{
          backgroundColor: isDragOver
            ? "color-mix(in srgb, var(--primary-color) 25%, rgb(var(--bg-color-secondary)))"
            : "rgb(var(--bg-color-secondary))"
        }}
        title={`Send files to ${peer.name}`}
      >
        {/* Animated Progress Ring */}
        {isTransferring && (
          <svg className="absolute -inset-1.5 h-23 w-23 -rotate-90 pointer-events-none" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="currentColor"
              strokeWidth="4"
              className="text-(--border-color) opacity-30"
              fill="none"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke={toneColor}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              className="transition-[stroke-dashoffset] duration-150"
            />
          </svg>
        )}

        {/* Icon */}
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-300"
          style={{ color: toneColor }}
        >
          <Icon name={getDeviceIcon()} className="h-8 w-8 fill-current" />
        </div>

        {/* Action button menu trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[rgb(var(--bg-color))] border border-(--border-color) text-xs shadow hover:scale-110"
          title="Actions"
        >
          ⋯
        </button>
      </button>

      {/* Peer Label */}
      <div className="mt-2 text-center max-w-[120px]">
        <div className="text-sm font-semibold truncate leading-tight">{peer.name}</div>
        <div className="text-[11px] opacity-70 truncate mt-0.5">
          {peer.device.os} • {peer.device.type}
        </div>
      </div>

      {/* Context Menu Dropdown */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
            }}
          />
          <div
            className="absolute top-22 z-50 flex flex-col min-w-36 overflow-hidden rounded-xl border border-(--border-color) bg-[rgb(var(--dialog-bg-color))] py-1 shadow-2xl animate-[fade-in_150ms_ease]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-(--primary-color)/15 transition-colors"
              onClick={() => {
                setShowMenu(false);
                fileInputRef.current?.click();
              }}
            >
              <Icon name="upload" className="h-4 w-4 fill-current text-(--primary-color)" />
              Send File
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-(--primary-color)/15 transition-colors"
              onClick={() => {
                setShowMenu(false);
                onSendMessage(peer);
              }}
            >
              <Icon name="chat" className="h-4 w-4 fill-current text-(--primary-color)" />
              Send Message
            </button>
          </div>
        </>
      )}
    </div>
  );
}
