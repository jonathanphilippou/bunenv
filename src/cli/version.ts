import { Command } from "commander";
import { resolveVersion } from "../resolvers/version-resolver";
import { errorAndExit, info, logError } from "./utils/output";
import { displayVersion } from "./utils/validation";

/**
 * Configures the version command for the CLI
 *
 * @param program - Commander program instance
 */
export function versionCommand(program: Command): void {
  program
    .command("version")
    .description("Show the current active Bun version")
    .option("-v, --verbose", "Show detailed version information")
    .action(async (options) => {
      try {
        const currentVersion = await resolveVersion();

        if (currentVersion) {
          if (options.verbose) {
            info(
              `Current active Bun version: ${displayVersion(currentVersion)}`
            );
            // TODO: In a future ticket, show more detailed information like
            // installation path, source of version resolution (local/global/etc)
          } else {
            info(currentVersion);
          }
        } else {
          errorAndExit("No active Bun version found.", undefined, 1, [
            "Use bunenv global <version> to set a global version",
            "or bunenv local <version> to set a version for this directory.",
          ]);
        }
      } catch (error) {
        logError("Failed to determine current Bun version", error as Error);
        process.exit(1);
      }
    });
}
