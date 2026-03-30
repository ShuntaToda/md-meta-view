import fs from "node:fs";
import path from "node:path";
import type { Settings } from "./types.js";

const SETTINGS_FILE = "md-meta-view-setting.json";

export function loadSettings(dir: string): Settings {
  const filePath = path.resolve(dir, SETTINGS_FILE);
  if (!fs.existsSync(filePath)) return {};

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as Settings;
  } catch (e) {
    console.warn(
      `Warning: Failed to parse ${SETTINGS_FILE}: ${(e as Error).message}`,
    );
    return {};
  }
}
