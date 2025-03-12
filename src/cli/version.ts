import { Command } from "commander";
import { resolveVersion } from "../resolvers/version-resolver";

/**
 * Configures the version command for the CLI
 *
 * @param program - Commander program instance
 */
export function versionCommand(program: Command): void {
  program
    .command("version")
    .description("Show the current active Bun version")
    .action(async () => {
      try {
        const currentVersion = await resolveVersion();

        if (currentVersion) {
          console.log(currentVersion);
        } else {
          console.log("No active Bun version found.");
          console.log("Use bunenv global <version> to set a global version");
          console.log(
            "or bunenv local <version> to set a version for this directory."
          );
          process.exit(1);
        }
      } catch (error) {
        console.error((error as Error).message);
        process.exit(1);
      }
    });
}
