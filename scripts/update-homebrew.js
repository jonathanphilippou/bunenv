#!/usr/bin/env bun

/**
 * Script to update the Homebrew formula with the latest version of bunenv
 */

import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

async function main() {
  try {
    console.log("Updating Homebrew formula for bunenv...");

    // Get the current version from package.json
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
    const version = packageJson.version;

    console.log(`Current version: ${version}`);

    // Download the tarball to calculate the SHA256
    const tarballName = `bunenv-${version}.tgz`;

    try {
      // Check if the tarball already exists
      await fs.access(tarballName);
      console.log(`Tarball ${tarballName} already exists`);
    } catch (error) {
      // Download the tarball if it doesn't exist
      console.log(`Downloading tarball for version ${version}...`);
      execSync(`npm pack bunenv@${version}`);
    }

    // Calculate the SHA256 of the tarball
    const sha256 = execSync(`shasum -a 256 ${tarballName}`)
      .toString()
      .trim()
      .split(" ")[0];
    console.log(`SHA256: ${sha256}`);

    // Update the Homebrew formula
    const formulaPath = path.join(process.cwd(), "homebrew", "bunenv.rb");
    let formula = await fs.readFile(formulaPath, "utf-8");

    // Update the version and SHA256
    formula = formula.replace(
      /url "https:\/\/registry\.npmjs\.org\/bunenv\/-\/bunenv-.*\.tgz"/,
      `url "https://registry.npmjs.org/bunenv/-/bunenv-${version}.tgz"`
    );
    formula = formula.replace(/sha256 ".*"/, `sha256 "${sha256}"`);

    // Write the updated formula
    await fs.writeFile(formulaPath, formula);
    console.log(`Updated Homebrew formula at ${formulaPath}`);

    // Clean up tarball if needed
    // await fs.unlink(tarballName);
    // console.log(`Removed tarball ${tarballName}`);

    console.log("Homebrew formula update complete!");
  } catch (error) {
    console.error("Error updating Homebrew formula:", error);
    process.exit(1);
  }
}

main();
