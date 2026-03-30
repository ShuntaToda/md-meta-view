import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

export function resolveWebRoot(): string {
  const webPkgJson = require.resolve("@md-meta-view/web/package.json");
  return path.dirname(webPkgJson);
}
