import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import semver from "semver";

/**
 * Root directory for bunenv installations
 */
export const BUNENV_ROOT =
  process.env.BUNENV_ROOT || path.join(homedir(), ".bunenv");

/**
 * Directory where bun versions are installed
 */
export const VERSIONS_DIR = path.join(BUNENV_ROOT, "versions");

/**
 * Directory where shims are installed
 */
export const SHIMS_DIR = path.join(BUNENV_ROOT, "shims");

/**
 * Base URL for downloading Bun releases
 */
export const BUN_DOWNLOAD_URL =
  "https://github.com/oven-sh/bun/releases/download";

/**
 * Executes a command and returns the output
 *
 * @param command - Command to execute
 * @param args - Arguments for the command
 * @returns Promise resolving to stdout output or rejecting with stderr
 */
function execCommand(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args);
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });
  });
}

/**
 * Gets a list of all installed Bun versions
 *
 * @returns Array of installed version strings
 */
export async function listInstalledVersions(): Promise<string[]> {
  try {
    await fs.access(VERSIONS_DIR, fs.constants.R_OK);
    const entries = await fs.readdir(VERSIONS_DIR);

    // Filter out any non-directories and sort by semver
    const versions = await Promise.all(
      entries.map(async (entry) => {
        const stats = await fs.stat(path.join(VERSIONS_DIR, entry));
        return stats.isDirectory() ? entry : null;
      })
    );

    return versions
      .filter((v): v is string => v !== null)
      .sort((a, b) => {
        return semver.compare(a, b);
      });
  } catch (error) {
    // Directory doesn't exist or isn't readable
    return [];
  }
}

/**
 * Checks if a specific Bun version is installed
 *
 * @param version - Version to check
 * @returns True if the version is installed
 */
export async function isVersionInstalled(version: string): Promise<boolean> {
  try {
    await fs.access(path.join(VERSIONS_DIR, version), fs.constants.R_OK);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Gets the path to the bun executable for a specific version
 *
 * @param version - Version to get the path for
 * @returns Path to the bun executable
 * @throws Error if the version is not installed
 */
export function getBunPath(version: string): string {
  return path.join(VERSIONS_DIR, version, "bin", "bun");
}

/**
 * Determines the platform-specific download URL for a Bun version
 *
 * @param version - Bun version to download
 * @returns The URL for downloading the specific Bun version
 */
function getBunDownloadUrl(version: string): string {
  const platform = process.platform;
  const arch = process.arch;

  let platformStr: string;
  let archStr: string;

  // Determine platform string
  switch (platform) {
    case "darwin":
      platformStr = "darwin";
      break;
    case "linux":
      platformStr = "linux";
      break;
    case "win32":
      platformStr = "windows";
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  // Determine architecture string
  switch (arch) {
    case "x64":
      archStr = "x64";
      break;
    case "arm64":
      archStr = "aarch64";
      break;
    default:
      throw new Error(`Unsupported architecture: ${arch}`);
  }

  // Construct filename based on platform
  let filename: string;
  if (platform === "win32") {
    filename = `bun-${platformStr}-${archStr}.zip`;
  } else {
    filename = `bun-${platformStr}-${archStr}.zip`;
  }

  return `${BUN_DOWNLOAD_URL}/bun-v${version}/${filename}`;
}

/**
 * Downloads and extracts a specific Bun version
 *
 * @param version - Version to download
 * @param destDir - Destination directory
 * @returns Promise that resolves when download and extraction are complete
 */
async function downloadBunBinary(
  version: string,
  destDir: string
): Promise<void> {
  const url = getBunDownloadUrl(version);
  const tempZipPath = path.join(destDir, `bun-${version}.zip`);

  console.log(`Downloading Bun ${version} from ${url}`);

  try {
    // Download using curl or wget
    try {
      await execCommand("curl", ["-L", "-o", tempZipPath, url]);
    } catch (curlError) {
      // Try wget if curl fails
      await execCommand("wget", ["-O", tempZipPath, url]);
    }

    // Create bin directory
    const binDir = path.join(destDir, "bin");
    await fs.mkdir(binDir, { recursive: true });

    // Extract the zip file
    if (process.platform === "win32") {
      // Use unzip for Windows
      await execCommand("powershell", [
        "-Command",
        `Expand-Archive -Path "${tempZipPath}" -DestinationPath "${destDir}" -Force`,
      ]);
    } else {
      // Use unzip for Unix-like systems
      await execCommand("unzip", ["-o", tempZipPath, "-d", destDir]);
    }

    // Move files from extracted directory to the destination
    // This assumes the zip contains a directory named "bun-vX.Y.Z"
    const extractedDir = path.join(
      destDir,
      `bun-${process.platform}-${process.arch}`
    );
    if (await fileExists(extractedDir)) {
      // Move all files from extractedDir to destDir
      const files = await fs.readdir(extractedDir);
      await Promise.all(
        files.map(async (file) => {
          const sourcePath = path.join(extractedDir, file);
          const destPath = path.join(destDir, file);
          await fs.rename(sourcePath, destPath);
        })
      );

      // Remove the now empty extracted directory
      await fs.rmdir(extractedDir);
    }

    // Make bun executable
    const bunExePath = path.join(binDir, "bun");
    if (await fileExists(bunExePath)) {
      await fs.chmod(bunExePath, 0o755);
    }

    // Remove the zip file
    await fs.unlink(tempZipPath);
  } catch (error) {
    throw new Error(
      `Failed to download and extract Bun ${version}: ${(error as Error).message}`
    );
  }
}

/**
 * Helper function to check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Installs a specific version of Bun
 *
 * @param version - Version to install
 * @returns Promise that resolves when installation is complete
 */
export async function installVersion(version: string): Promise<void> {
  // Create the versions directory if it doesn't exist
  await fs.mkdir(VERSIONS_DIR, { recursive: true });

  const versionDir = path.join(VERSIONS_DIR, version);

  // Check if version is already installed
  if (await isVersionInstalled(version)) {
    console.log(`Bun ${version} is already installed.`);
    return;
  }

  console.log(`Installing Bun ${version}...`);

  try {
    // Create the version directory
    await fs.mkdir(versionDir, { recursive: true });

    // Download and extract Bun binary
    await downloadBunBinary(version, versionDir);

    console.log(`Bun ${version} has been installed.`);
  } catch (error) {
    // Clean up on failure
    try {
      await fs.rm(versionDir, { recursive: true, force: true });
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    throw new Error(
      `Failed to install Bun ${version}: ${(error as Error).message}`
    );
  }
}

/**
 * Sets the global default Bun version
 *
 * @param version - Version to set as global default
 * @returns Promise that resolves when the global version is set
 * @throws Error if the version is not installed
 */
export async function setGlobalVersion(version: string): Promise<void> {
  // Check if the version is installed
  if (!(await isVersionInstalled(version))) {
    throw new Error(
      `Bun ${version} is not installed. Use 'bunenv install ${version}' to install it.`
    );
  }

  // Create the bunenv root directory if it doesn't exist
  await fs.mkdir(BUNENV_ROOT, { recursive: true });

  // Write the version to the global version file
  await fs.writeFile(path.join(BUNENV_ROOT, "version"), version);

  console.log(`Global Bun version set to ${version}`);
}

/**
 * Sets the local Bun version for the current directory
 *
 * @param version - Version to set as local
 * @returns Promise that resolves when the local version is set
 * @throws Error if the version is not installed
 */
export async function setLocalVersion(version: string): Promise<void> {
  // Check if the version is installed
  if (!(await isVersionInstalled(version))) {
    throw new Error(
      `Bun ${version} is not installed. Use 'bunenv install ${version}' to install it.`
    );
  }

  // Write the version to the local version file
  await fs.writeFile(path.join(process.cwd(), ".bun-version"), version);

  console.log(`Local Bun version set to ${version}`);
}
