import { Command } from "commander";
import { resolveVersion } from "../resolvers/version-resolver";
import { listInstalledVersions } from "../versions/version-manager";

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
    .action(async () => {
      try {
        const installedVersions = await listInstalledVersions();

        if (installedVersions.length === 0) {
          console.log("No Bun versions installed.");
          console.log(
            "You can install a version with: bunenv install <version>"
          );
          return;
        }

        // Get the current active version to mark it
        const currentVersion = await resolveVersion();

        console.log("Installed Bun versions:");
        for (const version of installedVersions) {
          if (version === currentVersion) {
            console.log(`* ${version} (current)`);
          } else {
            console.log(`  ${version}`);
          }
        }
      } catch (error) {
        console.error((error as Error).message);
        process.exit(1);
      }
    });
}
