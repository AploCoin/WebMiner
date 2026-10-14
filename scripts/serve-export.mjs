import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("out");
const mimeTypes = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".txt": "text/plain", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".png": "image/png" };
createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const target = path.resolve(root, `.${pathname}`);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end();
    return;
  }
  for (const candidate of [target, `${target}.html`, path.join(target, "index.html")]) {
    try {
      if (!(await stat(candidate)).isFile()) continue;
      response.writeHead(200, { "Content-Type": mimeTypes[path.extname(candidate)] || "application/octet-stream" });
      response.end(await readFile(candidate));
      return;
    } catch { /* Try the next static-export path. */ }
  }
  response.writeHead(404).end("Not found");
}).listen(3219, "127.0.0.1", () => console.log("Static export: http://127.0.0.1:3219"));
