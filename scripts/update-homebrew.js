#!/usr/bin/env bun

/**
 * Update Homebrew Formula Script
 *
 * This script updates the Homebrew formula for bunenv when a new version is released.
 * It updates the version number and SHA256 hash in the formula file.
 */

import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

async function main() {
  // Get the current version from package.json
  const packageJson = JSON.parse(await fs.readFile("package.json", "utf-8"));
  const version = packageJson.version;

  console.log(`Updating Homebrew formula for bunenv ${version}...`);

  // Get the SHA256 hash of the npm package
  console.log("Calculating SHA256 hash...");
  const sha256 = execSync(
    `curl -sL https://registry.npmjs.org/bunenv/-/bunenv-${version}.tgz | shasum -a 256`
  )
    .toString()
    .trim()
    .split(" ")[0];

  console.log(`SHA256: ${sha256}`);

  // Read the formula template
  const formulaPath = path.join("homebrew", "bunenv.rb");
  let formula = await fs.readFile(formulaPath, "utf-8");

  // Update version and SHA256
  formula = formula.replace(
    /url "https:\/\/registry\.npmjs\.org\/bunenv\/-\/bunenv-.*\.tgz"/,
    `url "https://registry.npmjs.org/bunenv/-/bunenv-${version}.tgz"`
  );

  formula = formula.replace(/sha256 ".*"/, `sha256 "${sha256}"`);

  // Write the updated formula
  await fs.writeFile(formulaPath, formula);

  console.log(`Homebrew formula updated for version ${version}`);
  console.log(`Formula updated at: ${formulaPath}`);
  console.log("\nNext steps:");
  console.log(
    "1. Test the formula: brew install --build-from-source ./homebrew/bunenv.rb"
  );
  console.log("2. Update your tap or submit a PR to Homebrew Core");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
