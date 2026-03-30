import path from "node:path";
import {
  collectFrontmatterKeys,
  loadSettings,
  parseDirectory,
} from "@md-meta-view/core";
import { watch } from "chokidar";
import open from "open";
import { createServer } from "vite";
import { WebSocketServer } from "ws";
import { resolveWebRoot } from "./resolve-web.js";

export async function startDev(targetDir: string, port: number) {
  const absTargetDir = path.resolve(targetDir);
  console.log(`Scanning: ${absTargetDir}`);

  const settings = loadSettings(absTargetDir);
  if (settings.idField) console.log(`  idField: ${settings.idField}`);
  if (settings.exclude?.length)
    console.log(`  exclude: ${settings.exclude.join(", ")}`);

  let entries = await parseDirectory(absTargetDir, settings);
  let keys = collectFrontmatterKeys(entries);

  const wss = new WebSocketServer({ port: port + 1 });

  const broadcastUpdate = async () => {
    entries = await parseDirectory(absTargetDir, settings);
    keys = collectFrontmatterKeys(entries);
    const message = JSON.stringify({
      type: "update",
      data: { entries, keys, settings },
    });
    for (const client of wss.clients) {
      if (client.readyState === 1) {
        client.send(message);
      }
    }
  };

  const watcher = watch(path.join(absTargetDir, "**/*.md"), {
    ignoreInitial: true,
    depth: 5,
    ignored: ["**/node_modules/**", "**/.*"],
  });
  watcher.on("add", broadcastUpdate);
  watcher.on("change", broadcastUpdate);
  watcher.on("unlink", broadcastUpdate);

  const projectRoot = resolveWebRoot();

  const viteServer = await createServer({
    root: projectRoot,
    server: {
      port,
      open: false,
    },
    plugins: [
      {
        name: "md-meta-view-api",
        configureServer(server) {
          server.middlewares.use("/api/entries", (_req, res) => {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ entries, keys, settings }));
          });
          server.middlewares.use("/api/ws-port", (_req, res) => {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ port: port + 1 }));
          });
        },
      },
    ],
  });

  await viteServer.listen();

  const url = `http://localhost:${port}`;
  console.log(`\n  md-meta-view dev server running at ${url}`);
  console.log(`  Watching for changes in ${absTargetDir}\n`);

  await open(url);
}
