import fs from "node:fs";
import path from "node:path";
import {
  collectFrontmatterKeys,
  loadSettings,
  parseDirectory,
} from "@md-meta-view/core";
import { build as viteBuild } from "vite";
import { resolveWebRoot } from "./resolve-web.js";

export async function build(targetDir: string, outDir: string) {
  const absTargetDir = path.resolve(targetDir);
  const absOutDir = path.resolve(outDir);

  console.log(`Scanning: ${absTargetDir}`);

  const settings = loadSettings(absTargetDir);
  if (settings.idField) console.log(`  idField: ${settings.idField}`);
  if (settings.exclude?.length)
    console.log(`  exclude: ${settings.exclude.join(", ")}`);

  const entries = await parseDirectory(absTargetDir, settings);
  const keys = collectFrontmatterKeys(entries);

  console.log(`Found ${entries.length} markdown files`);

  const projectRoot = resolveWebRoot();

  const dataJson = JSON.stringify({ entries, keys, settings });
  const dataFilePath = path.join(projectRoot, "public", "data.json");

  fs.mkdirSync(path.join(projectRoot, "public"), { recursive: true });
  fs.writeFileSync(dataFilePath, dataJson, "utf-8");

  await viteBuild({
    root: projectRoot,
    build: {
      outDir: absOutDir,
      emptyOutDir: true,
    },
  });

  fs.unlinkSync(dataFilePath);

  console.log(`\nBuild complete: ${absOutDir}`);
}
