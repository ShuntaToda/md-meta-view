import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadSettings } from "./settings.js";

const fixturesDir = path.resolve(import.meta.dirname, "../../fixtures");

describe("loadSettings", () => {
  it("loads settings from md-meta-view-setting.json", () => {
    const settings = loadSettings(fixturesDir);

    expect(settings.idField).toBe("number");
    expect(settings.exclude).toEqual(["excluded.md"]);
  });

  it("returns empty object when file does not exist", () => {
    const settings = loadSettings("/nonexistent/path");

    expect(settings).toEqual({});
  });

  describe("with invalid JSON", () => {
    let tmpDir: string;

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "md-meta-view-test-"));
      fs.writeFileSync(
        path.join(tmpDir, "md-meta-view-setting.json"),
        "{ invalid json",
      );
    });

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true });
    });

    it("returns empty object and warns on invalid JSON", () => {
      const settings = loadSettings(tmpDir);

      expect(settings).toEqual({});
    });
  });
});
