import { Command } from "commander";
import { rehashShims } from "../shims/shim-manager";

/**
 * Configures the rehash command for the CLI
 *
 * @param program - Commander program instance
 */
export function rehashCommand(program: Command): void {
  program
    .command("rehash")
    .description("Rebuild Bun shim executables")
    .action(async () => {
      try {
        await rehashShims();
      } catch (error) {
        console.error((error as Error).message);
        process.exit(1);
      }
    });
}
