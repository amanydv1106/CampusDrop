/**
 * Generates an RFC4122 v4 UUID with fallback for insecure HTTP contexts
 * (e.g. testing from mobile or another device over local LAN http://192.168.x.x)
 * where window.crypto.randomUUID() is not exposed by browsers.
 */
export function generateUUID(): string {
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {
    return window.crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
