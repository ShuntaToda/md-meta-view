import esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: "dist-cli/index.js",
  packages: "external",
  banner: {
    js: "#!/usr/bin/env node",
  },
});

console.log("CLI build complete: dist-cli/index.js");
