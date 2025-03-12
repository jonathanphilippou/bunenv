/**
 * Configuration module
 * Centralizes configuration constants and environment-specific settings
 */
import { getArchitecture, getOperatingSystem } from "./environment";

/**
 * Default download URL template for Bun releases
 */
export const BUN_DOWNLOAD_URL_TEMPLATE =
  "https://github.com/oven-sh/bun/releases/download/bun-v{VERSION}/bun-{PLATFORM}-{ARCH}.zip";

/**
 * Default version to use when no specific version is specified
 * Can be overridden by BUNENV_DEFAULT_VERSION environment variable
 */
export const DEFAULT_VERSION = process.env.BUNENV_DEFAULT_VERSION || "latest";

/**
 * Environment variable name for the active Bun version
 */
export const VERSION_ENV_VAR = "BUNENV_VERSION";

/**
 * Environment variable name for the bunenv root directory
 */
export const ROOT_ENV_VAR = "BUNENV_ROOT";

/**
 * Default file name for storing the Bun version in a project
 */
export const VERSION_FILE_NAME = ".bun-version";

/**
 * Get the download URL for a specific Bun version
 * @param version The Bun version to download
 * @returns The download URL
 */
export function getBunDownloadUrl(version: string): string {
  const os = getOperatingSystem();
  const arch = getArchitecture();

  // For Windows, the download URL uses "win" instead of "windows"
  let platformString = os === "windows" ? "win" : os;

  // Special handling for architectures
  let architecture = arch === "arm64" ? "aarch64" : arch;

  return BUN_DOWNLOAD_URL_TEMPLATE.replace("{VERSION}", version)
    .replace("{PLATFORM}", platformString)
    .replace("{ARCH}", architecture);
}

/**
 * Get the global configuration with appropriate defaults
 */
export function getConfig() {
  return {
    defaultVersion: DEFAULT_VERSION,
    versionEnvVar: VERSION_ENV_VAR,
    rootEnvVar: ROOT_ENV_VAR,
    versionFileName: VERSION_FILE_NAME,
  };
}
