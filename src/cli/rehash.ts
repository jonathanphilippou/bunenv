import { Command } from "commander";
import { rehashShims } from "../shims/shim-manager";
import { logError, success } from "./utils/output";

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
        success("Bun shim executables rebuilt successfully");
      } catch (error) {
        logError("Failed to rebuild Bun shim executables", error as Error);
        process.exit(1);
      }
    });
}
