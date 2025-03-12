/**
 * Paths module
 * Centralizes and standardizes path references throughout the application
 */
import os from "node:os";
import path from "node:path";

/**
 * Get the root directory for bunenv
 * Uses BUNENV_ROOT environment variable if set, otherwise defaults to ~/.bunenv
 * @returns The path to the bunenv root directory
 */
export function getBunenvRoot(): string {
  return process.env.BUNENV_ROOT || path.join(os.homedir(), ".bunenv");
}

/**
 * Get the directory where Bun versions are installed
 * @returns The path to the versions directory
 */
export function getVersionsDir(): string {
  return path.join(getBunenvRoot(), "versions");
}

/**
 * Get the directory where shims are stored
 * @returns The path to the shims directory
 */
export function getShimsDir(): string {
  return path.join(getBunenvRoot(), "shims");
}

/**
 * Get the path to the global version file
 * @returns The path to the global version file
 */
export function getGlobalVersionFile(): string {
  return path.join(getBunenvRoot(), "version");
}

/**
 * Get the name of the local version file
 * @returns The name of the local version file
 */
export function getLocalVersionFileName(): string {
  return ".bun-version";
}

/**
 * Get the path to the bunenv executable
 * @returns The path to the bunenv executable
 */
export function getBunenvExecutable(): string {
  return path.join(getBunenvRoot(), "bin", "bunenv");
}

/**
 * Get the path to a specific Bun version
 * @param version The Bun version
 * @returns The path to the specified Bun version
 */
export function getVersionPath(version: string): string {
  return path.join(getVersionsDir(), version);
}

/**
 * Get the path to the Bun binary for a specific version
 * @param version The Bun version
 * @returns The path to the Bun binary
 */
export function getBunBinaryPath(version: string): string {
  return path.join(getVersionsDir(), version, "bin", "bun");
}

/**
 * Get the path to the Bun executable for a specific version
 * @param version The Bun version
 * @returns The path to the Bun executable for the specified version
 */
export function getBunExecutable(version: string): string {
  return getBunBinaryPath(version);
}

/**
 * Normalize a path for the current platform
 * @param p The path to normalize
 * @returns The normalized path
 */
export function normalizePath(p: string): string {
  return path.normalize(p);
}
