import { cac } from "cac";
import { build } from "./build.js";
import { startDev } from "./dev.js";

const cli = cac("md-meta-view");

cli
  .command("[dir]", "Start dev server to browse markdown files")
  .option("--port <port>", "Port number", { default: 3000 })
  .action(async (dir: string | undefined, options: { port: number }) => {
    const targetDir = dir || ".";
    await startDev(targetDir, options.port);
  });

cli
  .command("build [dir]", "Build static site")
  .option("--out <dir>", "Output directory", { default: "dist" })
  .action(async (dir: string | undefined, options: { out: string }) => {
    const targetDir = dir || ".";
    await build(targetDir, options.out);
  });

cli.help();
cli.version("0.1.0");

try {
  cli.parse(process.argv, { run: false });
  await cli.runMatchedCommand();
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
