import { readFile } from "fs/promises";
import path from "path";

export async function GET() {
  const htmlPath = path.join(process.cwd(), "public", "index.html");
  const html = await readFile(htmlPath, "utf-8");
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    },
  });
}
