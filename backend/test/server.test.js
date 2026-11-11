import test from "node:test";
import assert from "node:assert";
import { spawn } from "node:child_process";

test("Campus Drop Server starts up, handles /health, and accepts WebSockets", async () => {
  const proc = spawn("node", ["server/index.js"], {
    env: { ...process.env, PORT: "3099" },
    stdio: "pipe"
  });

  await new Promise((resolve) => setTimeout(resolve, 1500));

  try {
    const res = await fetch("http://localhost:3099/health");
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, "ok");
    assert.strictEqual(data.service, "Campus Drop Signaling Server");

    const ws = new globalThis.WebSocket("ws://localhost:3099/server?webrtc_supported=true");
    const received = await new Promise((resolve, reject) => {
      ws.addEventListener("message", (e) => {
        resolve(JSON.parse(e.data));
      });
      ws.addEventListener("error", reject);
      setTimeout(() => reject(new Error("Timeout")), 3000);
    });

    assert.ok(received.type === "ping" || received.type === "ws-config" || received.type === "display-name");
    ws.close();
  } finally {
    proc.kill();
  }
});
