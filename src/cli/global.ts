import { Command } from "commander";
import {
  isVersionInstalled,
  setGlobalVersion,
} from "../versions/version-manager";

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
          const fs = await import("node:fs/promises");
          const path = await import("node:path");
          const homedir = await import("node:os").then((os) => os.homedir);

          const globalVersionFile = path.join(homedir(), ".bunenv", "version");

          try {
            const globalVersion = await fs.readFile(globalVersionFile, "utf-8");
            console.log(`Current global Bun version: ${globalVersion.trim()}`);
          } catch (error) {
            console.log("No global Bun version set.");
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

        await setGlobalVersion(version);
      } catch (error) {
        console.error((error as Error).message);
        process.exit(1);
      }
    });
}
