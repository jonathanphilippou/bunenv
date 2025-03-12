/**
 * Environment detection module
 * Provides utilities for detecting OS, architecture, and shell information
 */

/**
 * Get the current operating system
 * @returns The detected operating system or 'unknown'
 */
export function getOperatingSystem():
  | "darwin"
  | "linux"
  | "windows"
  | "unknown" {
  const platform = process.platform;

  if (platform === "darwin") {
    return "darwin";
  } else if (platform === "linux") {
    return "linux";
  } else if (platform === "win32") {
    return "windows";
  }

  return "unknown";
}

/**
 * Get the current system architecture
 * @returns The detected architecture or 'unknown'
 */
export function getArchitecture(): "x64" | "arm64" | "unknown" {
  const arch = process.arch;

  if (arch === "x64") {
    return "x64";
  } else if (arch === "arm64") {
    return "arm64";
  }

  return "unknown";
}

/**
 * Detect the shell type from environment variables
 * @returns The detected shell type or 'unknown'
 */
export function getShellType():
  | "bash"
  | "zsh"
  | "fish"
  | "powershell"
  | "cmd"
  | "unknown" {
  // Check environment variables to detect the shell
  const shell = process.env.SHELL || "";

  if (process.env.ZSH_VERSION) {
    return "zsh";
  } else if (shell.includes("bash")) {
    return "bash";
  } else if (shell.includes("fish")) {
    return "fish";
  } else if (process.env.PSModulePath && process.platform === "win32") {
    return "powershell";
  } else if (process.env.COMSPEC && process.platform === "win32") {
    return "cmd";
  }

  return "unknown";
}

/**
 * Check if running on macOS
 * @returns true if the OS is macOS
 */
export function isMacOS(): boolean {
  return process.platform === "darwin";
}

/**
 * Check if running on Linux
 * @returns true if the OS is Linux
 */
export function isLinux(): boolean {
  return process.platform === "linux";
}

/**
 * Check if running on Windows
 * @returns true if the OS is Windows
 */
export function isWindows(): boolean {
  return process.platform === "win32";
}

/**
 * Get the platform name formatted for download URLs
 * @returns The platform name for download URLs
 */
export function getDownloadPlatform(): string {
  const os = getOperatingSystem();
  return os;
}

/**
 * Get the architecture formatted for download URLs
 * @returns The architecture name for download URLs
 */
export function getDownloadArchitecture(): string {
  const arch = getArchitecture();

  // Bun releases use "aarch64" for ARM64 architecture
  if (arch === "arm64") {
    return "aarch64";
  }

  return arch;
}
