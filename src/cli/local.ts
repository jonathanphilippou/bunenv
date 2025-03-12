import { Command } from "commander";
import { VERSION_FILE_NAME } from "../resolvers/version-resolver";
import {
  isVersionInstalled,
  setLocalVersion,
} from "../versions/version-manager";

/**
 * Configures the local command for the CLI
 *
 * @param program - Commander program instance
 */
export function localCommand(program: Command): void {
  program
    .command("local")
    .description(
      `Set or show the local Bun version (creates ${VERSION_FILE_NAME})`
    )
    .argument("[version]", "Version to set as local (e.g., 1.0.0)")
    .action(async (version?: string) => {
      try {
        if (!version) {
          // Show current local version
          const fs = await import("node:fs/promises");
          const path = await import("node:path");

          const localVersionFile = path.join(process.cwd(), VERSION_FILE_NAME);

          try {
            const localVersion = await fs.readFile(localVersionFile, "utf-8");
            console.log(`Current local Bun version: ${localVersion.trim()}`);
          } catch (error) {
            console.log(
              `No local Bun version set. No ${VERSION_FILE_NAME} file found.`
            );
          }

          return;
        }

        // Check if the version is installed
        if (!(await isVersionInstalled(version))) {
          console.error(
            `Bun ${version} is not installed. Use 'bunenv install ${version}' to install it.`
          );
          process.exit(1);
        }

        await setLocalVersion(version);
      } catch (error) {
        console.error((error as Error).message);
        process.exit(1);
      }
    });
}
