#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cac } from "cac";
import { getPackageVersion } from "./utils.js";
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

    // Inject static mode into index.html
    const indexPath = path.join(absOutDir, "index.html");
    const html = fs.readFileSync(indexPath, "utf-8");
    fs.writeFileSync(
      indexPath,
      html.replace(
        "<head>",
        '<head><script>window.__MD_META_VIEW_MODE__="static"</script>',
      ),
    );

    // Write meta.json (frontmatter only, no html)
    const meta = entries.map(({ html: _, ...rest }) => rest);
    fs.writeFileSync(
      path.join(absOutDir, "meta.json"),
      JSON.stringify({ entries: meta, keys, settings }),
      "utf-8",
    );

    // Write individual entry files with html
    const entriesDir = path.join(absOutDir, "entries");
    fs.mkdirSync(entriesDir, { recursive: true });
    for (const entry of entries) {
      const filename = `${encodeURIComponent(entry.id)}.json`;
      fs.writeFileSync(
        path.join(entriesDir, filename),
        JSON.stringify(entry),
        "utf-8",
      );
    }

    console.log(`\nBuild complete: ${absOutDir}`);
  });

cli.help();
cli.version(getPackageVersion());

try {
  cli.parse(process.argv, { run: false });
  await cli.runMatchedCommand();
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
