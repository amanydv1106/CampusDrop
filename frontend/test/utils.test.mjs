import test from "node:test";
import assert from "node:assert/strict";

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

test("formatFileSize formats bytes correctly", () => {
  assert.equal(formatFileSize(500), "500 B");
  assert.equal(formatFileSize(1024), "1.0 KB");
  assert.equal(formatFileSize(1048576), "1.0 MB");
  assert.equal(formatFileSize(1073741824), "1.00 GB");
  assert.equal(formatFileSize(5368709120), "5.00 GB");
});

test("Room code format validation", () => {
  const code = "ALPHA";
  assert.equal(code.length, 5);
  assert.match(code, /^[A-Z0-9]{5}$/);
});

test("Pairing key format validation", () => {
  const key = "123456";
  assert.equal(key.length, 6);
  assert.match(key, /^\d{6}$/);
  const formatted = `${key.slice(0, 3)} ${key.slice(3)}`;
  assert.equal(formatted, "123 456");
});
