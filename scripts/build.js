#!/usr/bin/env bun

/**
 * Build script for bunenv
 * Handles TypeScript compilation, bundling, and minification
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";

// Define build configurations
const configs = {
  development: {
    minify: false,
  },
  production: {
    minify: true,
  },
};

// Get command line args
const args = process.argv.slice(2);
const isProd = args.includes("--prod") || args.includes("--production");
const shouldClean = args.includes("--clean");

// Select the configuration
const config = isProd ? configs.production : configs.development;
console.log(`Building for ${isProd ? "production" : "development"}...`);

// Clean dist directory if needed
if (shouldClean) {
  console.log("Cleaning dist directory...");
  try {
    await fs.rm("dist", { recursive: true, force: true });
  } catch (err) {
    // Directory doesn't exist, which is fine
  }
}

// Create dist directory if it doesn't exist
await fs.mkdir("dist", { recursive: true });

// Run TypeScript compiler first to check types
console.log("Type checking...");
const tscResult = spawnSync("bun", ["x", "tsc", "--noEmit"], {
  stdio: "inherit",
});

if (tscResult.status !== 0) {
  console.error("Type checking failed. Build aborted.");
  process.exit(1);
}

// Run build
console.log("Bundling...");
const buildArgs = [
  "build",
  "./src/index.ts",
  "--outdir",
  "./dist",
  "--target",
  "node",
];

// Add minify flag if needed
if (config.minify) {
  buildArgs.push("--minify");
}

const buildResult = spawnSync("bun", buildArgs, { stdio: "inherit" });

if (buildResult.status !== 0) {
  console.error("Bundling failed. Build aborted.");
  process.exit(1);
}

// Ensure bin/bunenv is executable
console.log("Setting executable permissions...");
await fs.chmod("bin/bunenv", 0o755);

// Copy README and LICENSE to dist for packaging
console.log("Copying package files...");
await fs.copyFile("README.md", "dist/README.md");
await fs.copyFile("LICENSE", "dist/LICENSE");

// Create package info
const packageJson = JSON.parse(await fs.readFile("package.json", "utf-8"));
const distPackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  bin: packageJson.bin,
  type: packageJson.type,
  main: "index.js",
  dependencies: packageJson.dependencies,
  engines: packageJson.engines,
  repository: packageJson.repository,
  keywords: packageJson.keywords,
  author: packageJson.author,
  license: packageJson.license,
  bugs: packageJson.bugs,
  homepage: packageJson.homepage,
};

await fs.writeFile(
  "dist/package.json",
  JSON.stringify(distPackageJson, null, 2)
);

console.log("Build complete!");
