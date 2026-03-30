import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { watch } from "chokidar";
import { Hono } from "hono";
import open from "open";
import { WebSocketServer } from "ws";
import {
  collectFrontmatterKeys,
  parseDirectory,
} from "../core/parser.js";
import { loadSettings } from "../core/settings.js";
import type { MdEntry, Settings } from "../core/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface ServerState {
  entries: MdEntry[];
  keys: string[];
  settings: Settings;
}

export async function startServer(targetDir: string, port: number) {
  const absTargetDir = path.resolve(targetDir);
  console.log(`Scanning: ${absTargetDir}`);

  const settings = loadSettings(absTargetDir);
  if (settings.idField) console.log(`  idField: ${settings.idField}`);
  if (settings.exclude?.length)
    console.log(`  exclude: ${settings.exclude.join(", ")}`);

  const state: ServerState = {
    entries: await parseDirectory(absTargetDir, settings),
    keys: [],
    settings,
  };
  state.keys = collectFrontmatterKeys(state.entries);

  const app = new Hono();

  // API
  app.get("/api/entries", (c) => c.json(state));
  app.get("/api/ws-port", (c) => c.json({ port: port + 1 }));

  // Serve built client
  const clientPath = path.resolve(__dirname, "..", "client");
  if (fs.existsSync(clientPath)) {
    app.use("/*", serveStatic({ root: clientPath }));
    app.get("*", (c) => {
      const html = fs.readFileSync(path.join(clientPath, "index.html"), "utf-8");
      return c.html(html);
    });
  }

  const server = serve({ fetch: app.fetch, port }, () => {
    const url = `http://localhost:${port}`;
    console.log(`\n  md-meta-view running at ${url}`);
    console.log(`  Watching for changes in ${absTargetDir}\n`);
    open(url);
  });

  // WebSocket for live reload
  const wss = new WebSocketServer({ port: port + 1 });

  const broadcastUpdate = async () => {
    state.entries = await parseDirectory(absTargetDir, settings);
    state.keys = collectFrontmatterKeys(state.entries);
    const message = JSON.stringify({ type: "update", data: state });
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

  return server;
}
