/**
 * Version Manager Module
 * Handles installation, listing, and management of Bun versions
 */
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import semver from "semver";

import { getBunDownloadUrl as getConfigBunDownloadUrl } from "../core/config";
import { getOperatingSystem } from "../core/environment";
import {
  getBunBinaryPath,
  getGlobalVersionFile,
  getLocalVersionFileName,
  getVersionsDir,
} from "../core/paths";
import * as fsUtils from "../utils/fs";

/**
 * Execute a command and return its output
 * @param command Command to execute
 * @param args Command arguments
 * @returns Command output as string
 */
async function execCommand(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`Command failed: ${stderr}`));
      }
    });
  });
}

/**
 * List all installed Bun versions
 * @returns Array of installed version strings
 */
export async function listInstalledVersions(): Promise<string[]> {
  const versionsDir = getVersionsDir();

  try {
    // Ensure the versions directory exists
    await fsUtils.ensureDirectory(versionsDir);

    // Get all subdirectories in the versions directory
    const entries = await fs.readdir(versionsDir, { withFileTypes: true });
    const versionDirs = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    // Filter out invalid semver versions and sort
    return versionDirs
      .filter((version) => semver.valid(version))
      .sort(semver.compare);
  } catch (error) {
    // If there's an error, return an empty array
    return [];
  }
}

/**
 * Check if a specific Bun version is installed
 * @param version Version to check
 * @returns True if the version is installed, false otherwise
 */
export async function isVersionInstalled(version: string): Promise<boolean> {
  // Check if the binary exists
  const bunPath = getBunBinaryPath(version);
  return fsUtils.exists(bunPath);
}

/**
 * Get the path to the Bun binary for a specific version
 * @param version Bun version
 * @returns Path to the Bun binary
 */
export function getBunPath(version: string): string {
  return getBunBinaryPath(version);
}

/**
 * Get the download URL for a specific Bun version
 * @param version Bun version to download
 * @returns Download URL
 */
function getBunDownloadUrl(version: string): string {
  return getConfigBunDownloadUrl(version);
}

/**
 * Download and extract the Bun binary for a specific version
 * @param version Version to download
 * @param destDir Destination directory
 */
async function downloadBunBinary(
  version: string,
  destDir: string
): Promise<void> {
  // Ensure the destination directory exists
  await fsUtils.ensureDirectory(destDir);

  // Get the download URL
  const downloadUrl = getBunDownloadUrl(version);

  // Create a temporary directory for the download
  const tempDir = path.join(destDir, "_temp");
  await fsUtils.ensureDirectory(tempDir);

  try {
    // Download the binary
    console.log(`Downloading Bun ${version}...`);
    const zipPath = path.join(tempDir, `bun-${version}.zip`);

    // Use the built-in fetch API to download the file
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to download Bun ${version}: ${response.statusText}`
      );
    }

    // Save the file
    const buffer = await response.arrayBuffer();
    await fs.writeFile(zipPath, Buffer.from(buffer));

    // Extract the zip file
    console.log(`Extracting Bun ${version}...`);

    // Use different extraction methods depending on the OS
    if (getOperatingSystem() === "windows") {
      // Use PowerShell to extract on Windows
      await execCommand("powershell", [
        "-Command",
        `Expand-Archive -Path "${zipPath}" -DestinationPath "${destDir}" -Force`,
      ]);
    } else {
      // Use unzip on Unix-like systems
      await execCommand("unzip", ["-q", "-o", zipPath, "-d", destDir]);
    }

    // Make the binary executable on Unix-like systems
    if (getOperatingSystem() !== "windows") {
      const bunBin = getBunBinaryPath(version);
      await fs.chmod(bunBin, 0o755);
    }

    console.log(`Bun ${version} installed successfully.`);
  } finally {
    // Clean up the temporary directory
    await fsUtils.deleteDirectory(tempDir);
  }
}

/**
 * Check if a file exists
 * @param filePath Path to check
 * @returns True if the file exists, false otherwise
 */
async function fileExists(filePath: string): Promise<boolean> {
  return fsUtils.exists(filePath);
}

/**
 * Install a specific Bun version
 * @param version Version to install
 */
export async function installVersion(version: string): Promise<void> {
  // Normalize the version (remove leading v if present)
  const normalizedVersion = version.startsWith("v")
    ? version.slice(1)
    : version;

  // Check if already installed
  if (await isVersionInstalled(normalizedVersion)) {
    console.log(`Bun ${normalizedVersion} is already installed.`);
    return;
  }

  // Create the version directory
  const versionDir = path.join(getVersionsDir(), normalizedVersion);

  try {
    // Download and install
    await downloadBunBinary(normalizedVersion, versionDir);

    // Check if installation was successful
    if (!(await fileExists(getBunBinaryPath(normalizedVersion)))) {
      throw new Error(`Failed to install Bun ${normalizedVersion}.`);
    }

    console.log(`Bun ${normalizedVersion} installed successfully.`);
  } catch (error) {
    // Clean up if something went wrong
    await fsUtils.deleteDirectory(versionDir);
    throw error;
  }
}

/**
 * Set the global Bun version
 * @param version Version to set as global
 */
export async function setGlobalVersion(version: string): Promise<void> {
  // Check if the version is installed
  if (!(await isVersionInstalled(version))) {
    throw new Error(
      `Bun ${version} is not installed. Use 'bunenv install ${version}' to install it.`
    );
  }

  // Create the bunenv root directory if it doesn't exist
  const globalVersionFile = getGlobalVersionFile();
  await fsUtils.ensureDirectory(path.dirname(globalVersionFile));

  // Write the version to the global version file
  await fsUtils.writeFile(globalVersionFile, version);

  console.log(`Global Bun version set to ${version}.`);
}

/**
 * Set the local Bun version for the current directory
 * @param version Version to set as local
 */
export async function setLocalVersion(version: string): Promise<void> {
  // Check if the version is installed
  if (!(await isVersionInstalled(version))) {
    throw new Error(
      `Bun ${version} is not installed. Use 'bunenv install ${version}' to install it.`
    );
  }

  // Write the version to the local version file
  const localVersionFile = path.join(process.cwd(), getLocalVersionFileName());
  await fsUtils.writeFile(localVersionFile, version);

  console.log(`Local Bun version set to ${version}.`);
}
