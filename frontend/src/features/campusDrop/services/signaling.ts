type MessageHandler = (data: any) => void;

export class SignalingClient {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners: Map<string, Set<MessageHandler>> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isExplicitlyClosed = false;
  public isConnected = false;

  constructor() {
    this.url = this.resolveWsUrl();
  }

  private resolveWsUrl(): string {
    if (typeof window === "undefined") return "ws://localhost:3001";

    const envUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (envUrl) return envUrl;

    const hostname = window.location.hostname || "localhost";
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // If running in development with frontend on 3000, backend is on 3001
    return `${protocol}//${hostname}:3001`;
  }

  connect() {
    if (typeof window === "undefined") return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isExplicitlyClosed = false;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.emit("open", {});
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type) {
            this.emit(msg.type, msg);
          }
        } catch (err) {
          console.error("[Signaling] Failed to parse message:", err);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.emit("close", {});
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (err) => {
        this.emit("error", err);
      };
    } catch (err) {
      console.error("[Signaling] Connection attempt error:", err);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 2500);
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  on(type: string, handler: MessageHandler) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler);

    return () => {
      this.listeners.get(type)?.delete(handler);
    };
  }

  emit(type: string, data: any) {
    const handlers = this.listeners.get(type);
    if (handlers) {
      handlers.forEach((h) => {
        try {
          h(data);
        } catch (err) {
          console.error(`[Signaling Listener Error: ${type}]`, err);
        }
      });
    }
  }

  disconnect() {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}
