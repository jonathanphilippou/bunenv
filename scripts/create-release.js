#!/usr/bin/env bun

/**
 * Release notes generator for bunenv
 * Extracts release notes from CHANGELOG.md for GitHub releases
 */

import { execSync } from "node:child_process";
import fs from "node:fs/promises";

async function main() {
  // Get the current version from package.json
  const packageJson = JSON.parse(await fs.readFile("package.json", "utf-8"));
  const version = packageJson.version;

  console.log(`Generating release notes for version ${version}...`);

  // Read the CHANGELOG.md file
  const changelog = await fs.readFile("CHANGELOG.md", "utf-8");

  // Find the section for the current version
  const versionHeader = `## [${version}]`;
  const nextVersionHeader = "## [";

  let startIndex = changelog.indexOf(versionHeader);
  if (startIndex === -1) {
    console.error(`Version ${version} not found in CHANGELOG.md`);
    process.exit(1);
  }

  // Find the start of the next version section
  startIndex = changelog.indexOf("\n", startIndex) + 1;
  const endIndex = changelog.indexOf(nextVersionHeader, startIndex);

  // Extract the release notes
  const releaseNotes =
    endIndex !== -1
      ? changelog.substring(startIndex, endIndex).trim()
      : changelog.substring(startIndex).trim();

  // Print the release notes
  console.log("\nRelease Notes:\n");
  console.log(releaseNotes);
  console.log("\n");

  // Generate the tag message
  const tagMessage = `v${version}\n\n${releaseNotes}`;

  // Create a temporary file with the release notes
  await fs.writeFile(".release-notes.tmp", tagMessage);

  console.log("Release notes generated and saved to .release-notes.tmp");
  console.log("\nTo create a GitHub release:");
  console.log(
    `1. Create and push a tag: git tag -a v${version} -F .release-notes.tmp && git push origin v${version}`
  );
  console.log("2. Create a release on GitHub using the same release notes");

  // Prompt to create a tag
  console.log("\nWould you like to create and push the tag now? (y/n)");
  process.stdout.write("> ");

  // Read user input
  const response = await new Promise((resolve) => {
    process.stdin.once("data", (data) => {
      resolve(data.toString().trim().toLowerCase());
    });
  });

  if (response === "y" || response === "yes") {
    try {
      console.log(`\nCreating tag v${version}...`);
      execSync(`git tag -a v${version} -F .release-notes.tmp`, {
        stdio: "inherit",
      });

      console.log(`\nPushing tag v${version}...`);
      execSync(`git push origin v${version}`, { stdio: "inherit" });

      console.log("\nTag created and pushed successfully!");
      console.log("Now create a release on GitHub:");
      console.log(
        `https://github.com/${packageJson.repository.url.split("/").slice(-2, -1)[0]}/${packageJson.repository.url.split("/").pop().replace(".git", "")}/releases/new?tag=v${version}`
      );
    } catch (error) {
      console.error("\nFailed to create or push tag:", error.message);
    }
  } else {
    console.log("\nSkipping tag creation.");
  }

  // Clean up temporary file
  await fs.unlink(".release-notes.tmp");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
