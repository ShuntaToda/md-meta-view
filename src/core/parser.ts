import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import picomatch from "picomatch";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type { MdEntry, Settings } from "./types.js";

const MAX_DEPTH = 5;

const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize)
  .use(rehypeHighlight)
  .use(rehypeStringify);

function collectMdFiles(dir: string, baseDir: string, depth: number): string[] {
  if (depth > MAX_DEPTH) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (
      entry.isDirectory() &&
      !entry.name.startsWith(".") &&
      entry.name !== "node_modules"
    ) {
      files.push(...collectMdFiles(fullPath, baseDir, depth + 1));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

export async function parseMdFile(
  filePath: string,
  baseDir: string,
  settings: Settings,
): Promise<MdEntry> {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const result = await markdownProcessor.process(content);

  const relativePath = path.relative(baseDir, filePath);
  const id =
    settings.idField && data[settings.idField] != null
      ? String(data[settings.idField])
      : relativePath;

  return {
    id,
    filename: path.basename(filePath),
    relativePath,
    frontmatter: data,
    html: String(result),
  };
}

export async function parseDirectory(
  dir: string,
  settings: Settings = {},
): Promise<MdEntry[]> {
  const absDir = path.resolve(dir);
  let files = collectMdFiles(absDir, absDir, 0);

  if (settings.exclude && settings.exclude.length > 0) {
    const isExcluded = picomatch(settings.exclude);
    files = files.filter((f) => {
      const rel = path.relative(absDir, f);
      return !isExcluded(rel);
    });
  }

  const entries = await Promise.all(
    files.map((f) => parseMdFile(f, absDir, settings)),
  );
  return entries;
}

export function collectFrontmatterKeys(entries: MdEntry[]): string[] {
  const keys = new Set<string>();
  for (const entry of entries) {
    for (const key of Object.keys(entry.frontmatter)) {
      keys.add(key);
    }
  }
  return Array.from(keys);
}
