#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cac } from "cac";
import {
  collectFrontmatterKeys,
  parseDirectory,
} from "../core/parser.js";
import { loadSettings } from "../core/settings.js";
import { startServer } from "../server/server.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cli = cac("md-meta-view");

cli
  .command("[dir]", "Start server to browse markdown files")
  .option("--port <port>", "Port number", { default: 3000 })
  .action(async (dir: string | undefined, options: { port: number }) => {
    const targetDir = dir || ".";
    await startServer(targetDir, options.port);
  });

cli
  .command("build [dir]", "Build static site")
  .option("--out <dir>", "Output directory", { default: "dist" })
  .action(async (dir: string | undefined, options: { out: string }) => {
    const targetDir = dir || ".";
    const absTargetDir = path.resolve(targetDir);
    const absOutDir = path.resolve(options.out);

    console.log(`Scanning: ${absTargetDir}`);

    const settings = loadSettings(absTargetDir);
    if (settings.idField) console.log(`  idField: ${settings.idField}`);
    if (settings.exclude?.length)
      console.log(`  exclude: ${settings.exclude.join(", ")}`);

    const entries = await parseDirectory(absTargetDir, settings);
    const keys = collectFrontmatterKeys(entries);

    console.log(`Found ${entries.length} markdown files`);

    const clientPath = path.resolve(__dirname, "..", "client");
    if (!fs.existsSync(clientPath)) {
      console.error("Error: Built client not found. Run 'pnpm build' first.");
      process.exit(1);
    }

    fs.cpSync(clientPath, absOutDir, { recursive: true });

    const dataJson = JSON.stringify({ entries, keys, settings });
    fs.writeFileSync(path.join(absOutDir, "data.json"), dataJson, "utf-8");

    console.log(`\nBuild complete: ${absOutDir}`);
  });

cli.help();
cli.version("0.2.0");

try {
  cli.parse(process.argv, { run: false });
  await cli.runMatchedCommand();
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
