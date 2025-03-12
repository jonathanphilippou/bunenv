/**
 * Version Resolver Module
 * Responsible for determining which Bun version to use based on various sources
 */
import * as fs from "node:fs/promises";
import path from "node:path";
import semver from "semver";
import { VERSION_ENV_VAR } from "../core/config";
import { getGlobalVersionFile, getLocalVersionFileName } from "../core/paths";
import { listInstalledVersions } from "./version-manager";

/**
 * Find a version file by traversing up the directory tree
 * @returns The path to the version file, or null if not found
 */
export async function findVersionFile(): Promise<string | null> {
  const versionFileName = getLocalVersionFileName();
  let currentDir = process.cwd();
  const root = path.parse(currentDir).root;

  // Traverse up the directory tree until we find a version file or reach the root
  while (currentDir !== root) {
    const versionFilePath = path.join(currentDir, versionFileName);
    try {
      await fs.access(versionFilePath, fs.constants.R_OK);
      return versionFilePath;
    } catch (error) {
      // File doesn't exist or isn't readable, move up to parent directory
      currentDir = path.dirname(currentDir);
    }
  }

  // Check the root directory as well
  const rootVersionFile = path.join(root, versionFileName);
  try {
    await fs.access(rootVersionFile, fs.constants.R_OK);
    return rootVersionFile;
  } catch (error) {
    // No version file found
    return null;
  }
}

/**
 * Read the content of a version file
 * @param filePath Path to the version file
 * @returns The version string, or null if the file can't be read
 */
export async function readVersionFile(
  filePath: string
): Promise<string | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return content.trim();
  } catch (error) {
    return null;
  }
}

/**
 * Find a Bun version specified in package.json
 * @returns The version string, or null if not found
 */
export async function findVersionFromPackageJson(): Promise<string | null> {
  let currentDir = process.cwd();
  const root = path.parse(currentDir).root;

  // Traverse up the directory tree until we find a package.json or reach the root
  while (currentDir !== root) {
    const packageJsonPath = path.join(currentDir, "package.json");
    try {
      await fs.access(packageJsonPath, fs.constants.R_OK);

      // Read and parse package.json
      const content = await fs.readFile(packageJsonPath, "utf-8");
      const packageJson = JSON.parse(content);

      // Check if engines.bun exists
      if (packageJson.engines && packageJson.engines.bun) {
        return packageJson.engines.bun;
      }

      // Move up to parent directory
      currentDir = path.dirname(currentDir);
    } catch (error) {
      // File doesn't exist or isn't readable, move up to parent directory
      currentDir = path.dirname(currentDir);
    }
  }

  // No package.json with Bun version found
  return null;
}

/**
 * Resolve a version range or alias to an actual installed version
 * @param versionRange The version range or alias to resolve
 * @returns The resolved version, or the original version if it's not a range
 */
export async function resolveVersionRange(
  versionRange: string
): Promise<string> {
  // Handle 'latest' alias
  if (versionRange === "latest") {
    const installedVersions = await listInstalledVersions();
    if (installedVersions.length === 0) {
      return versionRange;
    }

    // Sort versions and return the highest one
    const sortedVersions = installedVersions.sort(semver.compare);
    return sortedVersions[sortedVersions.length - 1];
  }

  // Check if it's a semver range
  if (semver.validRange(versionRange) && !semver.valid(versionRange)) {
    const installedVersions = await listInstalledVersions();
    if (installedVersions.length === 0) {
      return versionRange;
    }

    // Find the highest version that satisfies the range
    const matchingVersions = installedVersions.filter((version) =>
      semver.satisfies(version, versionRange)
    );

    if (matchingVersions.length === 0) {
      return versionRange;
    }

    // Sort matching versions and return the highest one
    const sortedVersions = matchingVersions.sort(semver.compare);
    return sortedVersions[sortedVersions.length - 1];
  }

  // Not a range, return as is
  return versionRange;
}

/**
 * Determine which Bun version to use
 * @returns The resolved version, or null if no version is found
 */
export async function resolveVersion(): Promise<string | null> {
  // 1. Check environment variable
  const envVersion = process.env[VERSION_ENV_VAR];
  if (envVersion) {
    return envVersion;
  }

  // 2. Check local version file
  const versionFilePath = await findVersionFile();
  if (versionFilePath) {
    const version = await readVersionFile(versionFilePath);
    if (version) {
      return version;
    }
  }

  // 3. Check package.json
  const packageJsonVersion = await findVersionFromPackageJson();
  if (packageJsonVersion) {
    return packageJsonVersion;
  }

  // 4. Check global version file
  const globalVersionFile = getGlobalVersionFile();
  const globalVersion = await readVersionFile(globalVersionFile);
  if (globalVersion) {
    return globalVersion;
  }

  // No version found
  return null;
}
