import fs from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import semver from "semver";
import { listInstalledVersions } from "../versions/version-manager";

/**
 * Constants for file names and environment variables
 */
export const VERSION_FILE_NAME = ".bun-version";
export const GLOBAL_VERSION_FILE = path.join(homedir(), ".bunenv", "version");
export const ENV_VAR_NAME = "BUNENV_VERSION";

/**
 * Attempts to find a version file by walking up the directory tree
 *
 * @param startDir - Directory to start searching from (defaults to current directory)
 * @returns Path to version file if found, otherwise null
 */
export async function findVersionFile(
  startDir = process.cwd()
): Promise<string | null> {
  let currentDir = startDir;

  // Continue looking upward until we reach the root directory
  while (true) {
    const versionFilePath = path.join(currentDir, VERSION_FILE_NAME);

    try {
      await fs.access(versionFilePath, fs.constants.R_OK);
      return versionFilePath;
    } catch (error) {
      // File doesn't exist or isn't readable, move up a directory
      const parentDir = path.dirname(currentDir);

      // If we've reached the root directory, stop looking
      if (parentDir === currentDir) {
        return null;
      }

      currentDir = parentDir;
    }
  }
}

/**
 * Tries to read a package.json file for bun version info
 *
 * @param startDir - Directory to search from
 * @returns Bun version if specified in package.json engines field
 */
export async function findVersionFromPackageJson(
  startDir = process.cwd()
): Promise<string | null> {
  let currentDir = startDir;

  // Continue looking upward until we reach the root directory
  while (true) {
    const packageJsonPath = path.join(currentDir, "package.json");

    try {
      const content = await fs.readFile(packageJsonPath, "utf-8");
      const packageJson = JSON.parse(content);

      // Check for engines.bun field
      if (packageJson.engines?.bun) {
        return packageJson.engines.bun;
      }

      // Move up a directory
      const parentDir = path.dirname(currentDir);

      // If we've reached the root directory, stop looking
      if (parentDir === currentDir) {
        return null;
      }

      currentDir = parentDir;
    } catch (error) {
      // File doesn't exist or isn't readable, move up a directory
      const parentDir = path.dirname(currentDir);

      // If we've reached the root directory, stop looking
      if (parentDir === currentDir) {
        return null;
      }

      currentDir = parentDir;
    }
  }
}

/**
 * Reads the content of a version file
 *
 * @param versionFilePath - Path to version file
 * @returns Version string or null if file cannot be read
 */
export async function readVersionFile(
  versionFilePath: string
): Promise<string | null> {
  try {
    const content = await fs.readFile(versionFilePath, "utf-8");
    // Remove any whitespace or newlines
    return content.trim();
  } catch (error) {
    return null;
  }
}

/**
 * If the provided version is a semver range (like >=1.0.0), resolve it to an actual installed version
 *
 * @param versionRange - Version or version range
 * @returns Specific version that satisfies the range, or the original version string if it's not a range
 */
export async function resolveVersionRange(
  versionRange: string
): Promise<string> {
  // If it's an exact version, return it
  if (semver.valid(versionRange)) {
    return versionRange;
  }

  // Get all installed versions
  const installedVersions = await listInstalledVersions();

  if (installedVersions.length === 0) {
    // No versions installed, return the original range
    return versionRange;
  }

  // Try to find the best matching version for the range
  const matchingVersion = semver.maxSatisfying(installedVersions, versionRange);

  if (matchingVersion) {
    return matchingVersion;
  }

  // If no matching version found, return the original range
  return versionRange;
}

/**
 * Determines which Bun version to use based on environment variables and version files
 *
 * Resolution order:
 * 1. BUNENV_VERSION environment variable
 * 2. Local .bun-version file
 * 3. Engines field in package.json
 * 4. Global version file
 *
 * @returns The resolved version string or null if no version is found
 */
export async function resolveVersion(): Promise<string | null> {
  // 1. Check environment variable
  const envVersion = process.env[ENV_VAR_NAME];
  if (envVersion) {
    return await resolveVersionRange(envVersion);
  }

  // 2. Check for local .bun-version file
  const versionFilePath = await findVersionFile();
  if (versionFilePath) {
    const version = await readVersionFile(versionFilePath);
    if (version) {
      return await resolveVersionRange(version);
    }
  }

  // 3. Check package.json
  const packageJsonVersion = await findVersionFromPackageJson();
  if (packageJsonVersion) {
    return await resolveVersionRange(packageJsonVersion);
  }

  // 4. Check global version file
  try {
    const globalVersion = await readVersionFile(GLOBAL_VERSION_FILE);
    if (globalVersion) {
      return await resolveVersionRange(globalVersion);
    }
  } catch (error) {
    // Ignore errors reading global version file
  }

  return null;
}
