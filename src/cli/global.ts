import { Command } from "commander";
import fs from "node:fs/promises";
import { getGlobalVersionFile } from "../core/paths";
import {
  isVersionInstalled,
  setGlobalVersion,
} from "../versions/version-manager";
import { errorAndExit, info, logError, success } from "./utils/output";
import { isValidVersionFormat, normalizeVersion } from "./utils/validation";

/**
 * Configures the global command for the CLI
 *
 * @param program - Commander program instance
 */
export function globalCommand(program: Command): void {
  program
    .command("global")
    .description("Set or show the global Bun version")
    .argument("[version]", "Version to set as global (e.g., 1.0.0)")
    .action(async (version?: string) => {
      try {
        if (!version) {
          // Show current global version
          const globalVersionFile = getGlobalVersionFile();

          try {
            const globalVersion = await fs.readFile(globalVersionFile, "utf-8");
            info(`Current global Bun version: ${globalVersion.trim()}`);
          } catch (error) {
            info("No global Bun version set.");
          }

          return;
        }

        // Validate version format
        if (!isValidVersionFormat(version)) {
          errorAndExit(
            `Invalid version format: ${version}. Expected format: x.y.z`
          );
        }

        // Normalize version (remove v prefix if present)
        const normalizedVersion = normalizeVersion(version);

        // Check if the version is installed
        if (!(await isVersionInstalled(normalizedVersion))) {
          errorAndExit(
            `Bun ${normalizedVersion} is not installed.`,
            undefined,
            1,
            [`Use 'bunenv install ${normalizedVersion}' to install it.`]
          );
        }

        await setGlobalVersion(normalizedVersion);
        success(`Global Bun version set to ${normalizedVersion}`);
      } catch (error) {
        logError("Failed to set global Bun version", error as Error);
        process.exit(1);
      }
    });
}
