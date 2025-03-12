import { Command } from "commander";
import { spawn } from "node:child_process";
import { getShellEnv } from "../shims/shim-manager";
import { isVersionInstalled } from "../versions/version-manager";
import { errorAndExit, info, logError } from "./utils/output";
import { isValidVersionFormat, normalizeVersion } from "./utils/validation";

/**
 * Configures the shell command for the CLI
 *
 * @param program - Commander program instance
 */
export function shellCommand(program: Command): void {
  program
    .command("shell")
    .description("Set a specific Bun version in the current shell")
    .argument("<version>", "Bun version to use in this shell")
    .action(async (version: string) => {
      try {
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

        // Get the current shell
        const shell = process.env.SHELL || "/bin/bash";

        // Create environment variables for the new shell
        const env = {
          ...process.env,
          ...getShellEnv(normalizedVersion),
        };

        info(`Switching to Bun ${normalizedVersion}`);

        // Spawn a new shell with the modified environment
        const shellProcess = spawn(shell, [], {
          stdio: "inherit",
          env,
        });

        // Handle shell exit
        shellProcess.on("close", (code) => {
          info(`Shell exited with code ${code}`);
          process.exit(code || 0);
        });
      } catch (error) {
        logError(
          "Failed to start shell with specified Bun version",
          error as Error
        );
        process.exit(1);
      }
    });
}
