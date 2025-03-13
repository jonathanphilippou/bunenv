#!/usr/bin/env bun

/**
 * Fix Homebrew Installation Script
 *
 * This script fixes issues with the Homebrew installation of bunenv.
 * The main issue is that the symlink created by Homebrew points to the wrong location.
 */

import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

async function main() {
  try {
    console.log("Fixing bunenv Homebrew installation...");

    // Get the Homebrew prefix (where Homebrew is installed)
    const homebrewPrefix = execSync("brew --prefix").toString().trim();
    console.log(`Homebrew prefix: ${homebrewPrefix}`);

    // Check if bunenv is installed via Homebrew
    const cellarPath = path.join(homebrewPrefix, "Cellar", "bunenv");
    let isInstalled = false;

    try {
      await fs.access(cellarPath);
      isInstalled = true;
      console.log(`bunenv is installed in ${cellarPath}`);
    } catch (error) {
      console.log("bunenv is not installed via Homebrew");
      process.exit(1);
    }

    if (isInstalled) {
      // Find the installed version
      const versions = await fs.readdir(cellarPath);

      if (versions.length === 0) {
        console.log("No bunenv versions found in Cellar");
        process.exit(1);
      }

      const latestVersion = versions.sort().pop();
      console.log(`Latest installed version: ${latestVersion}`);

      const binPath = path.join(cellarPath, latestVersion, "bin");
      const libexecPath = path.join(cellarPath, latestVersion, "libexec");
      const symlinkPath = path.join(homebrewPrefix, "bin", "bunenv");

      // Check if the libexec directory exists
      let libexecExists = false;
      try {
        await fs.access(libexecPath);
        libexecExists = true;
        console.log(`libexec path exists: ${libexecPath}`);
      } catch (error) {
        console.log(`libexec path does not exist: ${libexecPath}`);
      }

      // Check if the bin directory exists
      let binExists = false;
      try {
        await fs.access(binPath);
        binExists = true;
        console.log(`bin path exists: ${binPath}`);
      } catch (error) {
        console.log(`bin path does not exist: ${binPath}`);
      }

      // Check where the bunenv executable actually is
      const libexecBinPath = libexecExists
        ? path.join(libexecPath, "bin", "bunenv")
        : null;
      const binBunenvPath = binExists ? path.join(binPath, "bunenv") : null;

      let targetPath = null;

      if (libexecExists) {
        try {
          await fs.access(libexecBinPath);
          console.log(`Found bunenv executable at: ${libexecBinPath}`);
          targetPath = libexecBinPath;
        } catch (error) {
          console.log(`No bunenv executable at: ${libexecBinPath}`);
        }
      }

      if (!targetPath && binExists) {
        try {
          await fs.access(binBunenvPath);
          console.log(`Found bunenv executable at: ${binBunenvPath}`);
          targetPath = binBunenvPath;
        } catch (error) {
          console.log(`No bunenv executable at: ${binBunenvPath}`);
        }
      }

      // Check if the symlink exists and where it points
      try {
        const symlinkTarget = await fs.readlink(symlinkPath);
        console.log(
          `Existing symlink at ${symlinkPath} points to: ${symlinkTarget}`
        );

        // Check if the symlink target exists
        try {
          await fs.access(
            path.resolve(path.dirname(symlinkPath), symlinkTarget)
          );
          console.log("Symlink target exists");
        } catch (error) {
          console.log("Symlink target does not exist - broken symlink");

          if (targetPath) {
            // Remove the broken symlink
            await fs.unlink(symlinkPath);
            console.log(`Removed broken symlink at ${symlinkPath}`);

            // Create a new symlink
            await fs.symlink(targetPath, symlinkPath);
            console.log(
              `Created new symlink from ${symlinkPath} to ${targetPath}`
            );
          }
        }
      } catch (error) {
        console.log(`No symlink at ${symlinkPath}`);

        if (targetPath) {
          // Create a new symlink
          await fs.symlink(targetPath, symlinkPath);
          console.log(
            `Created new symlink from ${symlinkPath} to ${targetPath}`
          );
        }
      }

      // Check if the fix worked
      try {
        const output = execSync("bunenv --version").toString().trim();
        console.log(`bunenv is now working correctly: ${output}`);
      } catch (error) {
        console.log("bunenv still not working correctly");
        console.error(error.message);
      }
    }
  } catch (error) {
    console.error("Error fixing bunenv Homebrew installation:", error);
    process.exit(1);
  }
}

main();
