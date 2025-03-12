import { Command } from "commander";
import { rehashShims } from "../shims/shim-manager";
import { installVersion } from "../versions/version-manager";
import { errorAndExit, logError, success } from "./utils/output";
import { isValidVersionFormat, normalizeVersion } from "./utils/validation";

/**
 * Configures the install command for the CLI
 *
 * @param program - Commander program instance
 */
export function installCommand(program: Command): void {
  program
    .command("install")
    .description("Install a specific version of Bun")
    .argument("<version>", "Version to install (e.g., 1.0.0)")
    .option("-f, --force", "Force reinstall if version is already installed")
    .action(async (version: string, options) => {
      try {
        // Validate version format
        if (!isValidVersionFormat(version)) {
          errorAndExit(
            `Invalid version format: ${version}. Expected format: x.y.z`
          );
        }

        // Normalize version (remove v prefix if present)
        const normalizedVersion = normalizeVersion(version);

        // Install the version
        await installVersion(normalizedVersion, options.force);

        // Rehash shims after installation
        await rehashShims();

        success(`Bun ${normalizedVersion} installed successfully.`);
      } catch (error) {
        logError(`Failed to install Bun ${version}`, error as Error);
        process.exit(1);
      }
    });
}
