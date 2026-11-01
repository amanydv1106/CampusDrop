import type { DeviceInfo } from "../types";

export function getDeviceInfo(): DeviceInfo {
  if (typeof window === "undefined") {
    return { type: "desktop", os: "Windows" };
  }

  const ua = window.navigator.userAgent;
  let type: "desktop" | "mobile" | "tablet" = "desktop";
  let os = "Unknown";

  if (/iPad|Tablet/i.test(ua)) {
    type = "tablet";
  } else if (/Mobi|Android|iPhone/i.test(ua)) {
    type = "mobile";
  }

  if (/Windows/i.test(ua)) {
    os = "Windows";
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = "macOS";
  } else if (/Linux/i.test(ua)) {
    os = "Linux";
  } else if (/Android/i.test(ua)) {
    os = "Android";
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    os = "iOS";
  }

  return { type, os };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
