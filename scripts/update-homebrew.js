#!/usr/bin/env bun

/**
 * Homebrew Formula Update Script
 *
 * This script automates the process of updating the Homebrew formula for bunenv.
 * It updates both the local formula and the formula in the tap repository.
 */

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

// Configuration
const CONFIG = {
  // GitHub information
  github: {
    username: "jonathanphilippou",
    repo: "bunenv",
    tapRepo: "homebrew-tap",
  },
  // Paths
  paths: {
    localFormula: path.join(process.cwd(), "homebrew", "bunenv.rb"),
    tempDir: path.join(process.cwd(), ".tmp"),
  },
  // Message templates
  messages: {
    commit: "chore: Update bunenv formula to v{VERSION}",
  },
};

/**
 * Get the SHA256 hash of a GitHub tarball
 */
async function getGitHubTarballHash(username, repo, version) {
  const url = `https://github.com/${username}/${repo}/archive/refs/tags/v${version}.tar.gz`;
  console.log(`Getting SHA256 hash for ${url}...`);

  try {
    const hash = execSync(`curl -sL ${url} | shasum -a 256`)
      .toString()
      .trim()
      .split(" ")[0];

    return hash;
  } catch (error) {
    console.error(`Error getting SHA256 hash: ${error.message}`);
    throw error;
  }
}

/**
 * Clone the tap repository
 */
async function cloneTapRepo(username, repo, tempDir) {
  console.log(`Cloning ${username}/${repo} to ${tempDir}...`);

  try {
    // Create temp directory if it doesn't exist
    if (!existsSync(tempDir)) {
      await fs.mkdir(tempDir, { recursive: true });
    }

    // Clone the repository
    execSync(
      `git clone https://github.com/${username}/${repo}.git ${tempDir}`,
      {
        stdio: "inherit",
      }
    );

    console.log(`Repository cloned successfully.`);
  } catch (error) {
    console.error(`Error cloning repository: ${error.message}`);
    throw error;
  }
}

/**
 * Update a Homebrew formula file with new version information
 */
async function updateFormulaFile(formulaPath, version, hash) {
  console.log(`Updating formula at ${formulaPath}...`);

  try {
    // Read the formula file
    let formula = await fs.readFile(formulaPath, "utf-8");

    // Update the version and hash in the formula
    formula = formula
      // Update URL
      .replace(
        /url "https:\/\/github\.com\/.*\/.*\/archive\/refs\/tags\/v.*\.tar\.gz"/,
        `url "https://github.com/${CONFIG.github.username}/${CONFIG.github.repo}/archive/refs/tags/v${version}.tar.gz"`
      )
      // Update SHA256
      .replace(/sha256 ".*"/, `sha256 "${hash}"`)
      // Update version in wrapper script
      .replace(
        /console\.log\("bunenv v.*"\)/,
        `console.log("bunenv v${version}")`
      )
      // Update version in test
      .replace(
        /assert_match "v.*", shell_output/,
        `assert_match "v${version}", shell_output`
      );

    // Write the updated formula
    await fs.writeFile(formulaPath, formula);

    console.log(`Formula updated successfully.`);
  } catch (error) {
    console.error(`Error updating formula: ${error.message}`);
    throw error;
  }
}

/**
 * Commit and push changes to the tap repository
 */
async function commitAndPushChanges(tempDir, version) {
  console.log(`Committing and pushing changes...`);

  try {
    const commitMessage = CONFIG.messages.commit.replace("{VERSION}", version);

    execSync(
      `cd ${tempDir} && git add Formula/bunenv.rb && git commit -m "${commitMessage}" && git push`,
      {
        stdio: "inherit",
      }
    );

    console.log(`Changes committed and pushed successfully.`);
  } catch (error) {
    console.error(`Error committing and pushing changes: ${error.message}`);
    throw error;
  }
}

/**
 * Update local formula
 */
async function updateLocalFormula(localFormulaPath, version, hash) {
  console.log(`Updating local formula at ${localFormulaPath}...`);

  try {
    await updateFormulaFile(localFormulaPath, version, hash);
    console.log(`Local formula updated successfully.`);
  } catch (error) {
    console.error(`Error updating local formula: ${error.message}`);
    throw error;
  }
}

/**
 * Clean up temporary files
 */
async function cleanup(tempDir) {
  console.log(`Cleaning up temporary files...`);

  try {
    await fs.rm(tempDir, { recursive: true, force: true });
    console.log(`Temporary files cleaned up successfully.`);
  } catch (error) {
    console.error(`Error cleaning up temporary files: ${error.message}`);
    // Don't throw an error for cleanup
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log("Updating Homebrew formula for bunenv...");

    // Get the current version from package.json
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
    const version = packageJson.version;

    console.log(`Current version: ${version}`);

    // Get the SHA256 hash of the GitHub tarball
    const hash = await getGitHubTarballHash(
      CONFIG.github.username,
      CONFIG.github.repo,
      version
    );
    console.log(`SHA256 hash: ${hash}`);

    // Update the local formula
    await updateLocalFormula(CONFIG.paths.localFormula, version, hash);

    // Clone the tap repository
    const tapDir = path.join(CONFIG.paths.tempDir, CONFIG.github.tapRepo);
    await cloneTapRepo(CONFIG.github.username, CONFIG.github.tapRepo, tapDir);

    // Update the formula in the tap repository
    const tapFormula = path.join(tapDir, "Formula", "bunenv.rb");
    await updateFormulaFile(tapFormula, version, hash);

    // Commit and push changes
    await commitAndPushChanges(tapDir, version);

    // Clean up
    await cleanup(CONFIG.paths.tempDir);

    console.log(`Homebrew formula updated to version ${version} successfully!`);
    console.log(
      `To test the formula: brew install --build-from-source ${CONFIG.github.username}/tap/bunenv`
    );
  } catch (error) {
    console.error(`Error updating Homebrew formula: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();
