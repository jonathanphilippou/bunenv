import { Command } from "commander";
import { rehashShims } from "../shims/shim-manager";
import { installVersion } from "../versions/version-manager";

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
    .action(async (version: string) => {
      try {
        await installVersion(version);
        // Rehash shims after installation
        await rehashShims();
      } catch (error) {
        console.error((error as Error).message);
        process.exit(1);
      }
    });
}
