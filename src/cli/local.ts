import { Command } from "commander";
import fs from "node:fs/promises";
import path from "node:path";
import { getLocalVersionFileName } from "../core/paths";
import {
  isVersionInstalled,
  setLocalVersion,
} from "../versions/version-manager";
import { errorAndExit, info, logError, success } from "./utils/output";
import { isValidVersionFormat, normalizeVersion } from "./utils/validation";

/**
 * Configures the local command for the CLI
 *
 * @param program - Commander program instance
 */
export function localCommand(program: Command): void {
  program
    .command("local")
    .description(
      `Set or show the local Bun version (creates ${getLocalVersionFileName()})`
    )
    .argument("[version]", "Version to set as local (e.g., 1.0.0)")
    .action(async (version?: string) => {
      try {
        if (!version) {
          // Show current local version
          const localVersionFile = path.join(
            process.cwd(),
            getLocalVersionFileName()
          );

          try {
            const localVersion = await fs.readFile(localVersionFile, "utf-8");
            info(`Current local Bun version: ${localVersion.trim()}`);
          } catch (error) {
            info(
              `No local Bun version set. No ${getLocalVersionFileName()} file found.`
            );
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

        await setLocalVersion(normalizedVersion);
        success(`Local Bun version set to ${normalizedVersion}`);
      } catch (error) {
        logError("Failed to set local Bun version", error as Error);
        process.exit(1);
      }
    });
}
