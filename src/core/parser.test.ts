import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  collectFrontmatterKeys,
  parseDirectory,
  parseMdFile,
} from "./parser.js";

const fixturesDir = path.resolve(import.meta.dirname, "../../fixtures");

describe("parseMdFile", () => {
  it("extracts frontmatter and renders HTML", async () => {
    const filePath = path.join(fixturesDir, "basic.md");
    const entry = await parseMdFile(filePath, fixturesDir, {});

    expect(entry.filename).toBe("basic.md");
    expect(entry.relativePath).toBe("basic.md");
    expect(entry.frontmatter.title).toBe("Test Document");
    expect(entry.frontmatter.date).toEqual(new Date("2026-01-15"));
    expect(entry.frontmatter.category).toBe("testing");
    expect(entry.frontmatter.tags).toEqual(["unit", "integration"]);
    expect(entry.html).toContain("<h1>");
    expect(entry.html).toContain("Test Document");
  });

  it("uses idField from settings when available", async () => {
    const filePath = path.join(fixturesDir, "basic.md");
    const entry = await parseMdFile(filePath, fixturesDir, {
      idField: "number",
    });

    expect(entry.id).toBe("001");
  });

  it("uses frontmatter id field by default when idField is not set", async () => {
    const filePath = path.join(fixturesDir, "basic.md");
    const entry = await parseMdFile(filePath, fixturesDir, {});

    // basic.md has no "id" field, falls back to filename
    expect(entry.id).toBe("basic");
  });

  it("falls back to filename when idField is missing from frontmatter", async () => {
    const filePath = path.join(fixturesDir, "no-frontmatter.md");
    const entry = await parseMdFile(filePath, fixturesDir, {
      idField: "number",
    });

    expect(entry.id).toBe("no-frontmatter");
  });

  it("handles files without frontmatter", async () => {
    const filePath = path.join(fixturesDir, "no-frontmatter.md");
    const entry = await parseMdFile(filePath, fixturesDir, {});

    expect(entry.frontmatter).toEqual({});
    expect(entry.html).toContain("No Frontmatter");
  });

  it("resolves relativePath for nested files", async () => {
    const filePath = path.join(fixturesDir, "sub/nested.md");
    const entry = await parseMdFile(filePath, fixturesDir, {});

    expect(entry.relativePath).toBe(path.join("sub", "nested.md"));
  });
});

describe("parseDirectory", () => {
  it("finds all markdown files recursively", async () => {
    const entries = await parseDirectory(fixturesDir);

    const filenames = entries.map((e) => e.filename).sort();
    expect(filenames).toContain("basic.md");
    expect(filenames).toContain("nested.md");
    expect(filenames).toContain("no-frontmatter.md");
    expect(filenames).toContain("excluded.md");
  });

  it("applies exclude patterns from settings", async () => {
    const entries = await parseDirectory(fixturesDir, {
      exclude: ["excluded.md"],
    });

    const filenames = entries.map((e) => e.filename);
    expect(filenames).not.toContain("excluded.md");
    expect(filenames).toContain("basic.md");
  });

  it("applies glob exclude patterns for subdirectories", async () => {
    const entries = await parseDirectory(fixturesDir, { exclude: ["sub/**"] });

    const filenames = entries.map((e) => e.filename);
    expect(filenames).not.toContain("nested.md");
    expect(filenames).toContain("basic.md");
  });

  it("uses idField for all entries", async () => {
    const entries = await parseDirectory(fixturesDir, { idField: "number" });

    const basic = entries.find((e) => e.filename === "basic.md");
    const nested = entries.find((e) => e.filename === "nested.md");
    const noFm = entries.find((e) => e.filename === "no-frontmatter.md");

    expect(basic?.id).toBe("001");
    expect(nested?.id).toBe("002");
    expect(noFm?.id).toBe("no-frontmatter");
  });
});

describe("collectFrontmatterKeys", () => {
  it("collects unique keys from all entries", async () => {
    const entries = await parseDirectory(fixturesDir);
    const keys = collectFrontmatterKeys(entries);

    expect(keys).toContain("title");
    expect(keys).toContain("date");
    expect(keys).toContain("category");
    expect(keys).toContain("tags");
    expect(keys).toContain("number");
  });

  it("returns empty array for entries without frontmatter", () => {
    const keys = collectFrontmatterKeys([
      {
        id: "1",
        filename: "a.md",
        relativePath: "a.md",
        frontmatter: {},
        html: "",
      },
    ]);

    expect(keys).toEqual([]);
  });
});
