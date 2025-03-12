/**
 * CLI input validation utilities
 * Provides validation functions for command input
 */
import { isVersionInstalled } from "../../versions/version-manager";

/**
 * Validate that a version string is properly formatted
 * @param version The version string to validate
 * @returns True if the version is valid, false otherwise
 */
export function isValidVersionFormat(version: string): boolean {
  // Basic version format check: x.y.z with optional prefix v
  const versionRegex = /^v?(\d+)\.(\d+)\.(\d+)(?:-.*)?$/;
  return versionRegex.test(version);
}

/**
 * Validate that a version exists in the installation
 * @param version The version to check
 * @returns Promise resolving to true if installed, false otherwise
 */
export async function isVersionValid(version: string): Promise<boolean> {
  if (!isValidVersionFormat(version)) {
    return false;
  }

  // Remove v prefix if present for consistency
  const normalizedVersion = version.startsWith("v")
    ? version.slice(1)
    : version;

  return await isVersionInstalled(normalizedVersion);
}

/**
 * Normalize a version string by removing 'v' prefix if present
 * @param version The version string to normalize
 * @returns The normalized version string
 */
export function normalizeVersion(version: string): string {
  return version.startsWith("v") ? version.slice(1) : version;
}

/**
 * Get a display version string with v prefix
 * @param version The version string
 * @returns The display version with v prefix
 */
export function displayVersion(version: string): string {
  if (!version) return "";
  return version.startsWith("v") ? version : `v${version}`;
}
