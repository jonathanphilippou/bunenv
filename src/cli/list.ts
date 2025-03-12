import { Command } from "commander";
import { resolveVersion } from "../resolvers/version-resolver";
import { listInstalledVersions } from "../versions/version-manager";
import { formatList, info, logError } from "./utils/output";

/**
 * Configures the list command for the CLI
 *
 * @param program - Commander program instance
 */
export function listCommand(program: Command): void {
  program
    .command("list")
    .alias("ls")
    .description("List all installed Bun versions")
    .option("-a, --all", "Show all versions, including system installations")
    .action(async (options) => {
      try {
        const installedVersions = await listInstalledVersions();

        if (installedVersions.length === 0) {
          info("No Bun versions installed.");
          info("You can install a version with: bunenv install <version>");
          return;
        }

        // Get the current active version to mark it
        const currentVersion = await resolveVersion();

        info("Installed Bun versions:");
        info(formatList(installedVersions, currentVersion || undefined));

        // Show system Bun if available and --all flag is used
        if (options.all) {
          // TODO: Implement system Bun detection in a future ticket
        }
      } catch (error) {
        logError("Failed to list installed Bun versions", error as Error);
        process.exit(1);
      }
    });
}
