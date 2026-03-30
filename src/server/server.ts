import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { watch } from "chokidar";
import { Hono } from "hono";
import open from "open";
import { WebSocketServer } from "ws";
import { collectFrontmatterKeys, parseDirectory } from "../core/parser.js";
import { loadSettings } from "../core/settings.js";
import type { MdEntry, MdEntryMeta, Settings } from "../core/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function toMeta(entry: MdEntry): MdEntryMeta {
  const { html: _, ...meta } = entry;
  return meta;
}

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

  // API: meta only (no html)
  app.get("/api/entries", (c) =>
    c.json({
      entries: state.entries.map(toMeta),
      keys: state.keys,
      settings: state.settings,
    }),
  );

  // API: individual entry with html
  app.get("/api/entries/:id", (c) => {
    const id = decodeURIComponent(c.req.param("id"));
    const entry = state.entries.find(
      (e) => e.id === id || e.relativePath === id,
    );
    if (!entry) return c.json({ error: "Not found" }, 404);
    return c.json(entry);
  });

  app.get("/api/ws-port", (c) => c.json({ port: port + 1 }));

  // Serve built client
  const clientPath = path.resolve(__dirname, "..", "client");
  if (fs.existsSync(clientPath)) {
    const rawHtml = fs.readFileSync(
      path.join(clientPath, "index.html"),
      "utf-8",
    );
    const injectedHtml = rawHtml.replace(
      "<head>",
      '<head><script>window.__MD_META_VIEW_MODE__="api"</script>',
    );

    app.use(
      "/assets/*",
      serveStatic({ root: clientPath }),
    );
    app.get("*", (c) => c.html(injectedHtml));
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
    const message = JSON.stringify({
      type: "update",
      data: {
        entries: state.entries.map(toMeta),
        keys: state.keys,
        settings: state.settings,
      },
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

  return server;
}
