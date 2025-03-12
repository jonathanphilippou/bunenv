import { Command } from "commander";
import { spawn } from "node:child_process";
import { getShellEnv } from "../shims/shim-manager";
import { isVersionInstalled } from "../versions/version-manager";

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
        // Check if the version is installed
        if (!(await isVersionInstalled(version))) {
          console.error(
            `Bun ${version} is not installed. Use 'bunenv install ${version}' to install it.`
          );
          process.exit(1);
        }

        // Get the current shell
        const shell = process.env.SHELL || "/bin/bash";

        // Create environment variables for the new shell
        const env = {
          ...process.env,
          ...getShellEnv(version),
        };

        console.log(`Switching to Bun ${version}`);

        // Spawn a new shell with the modified environment
        const shellProcess = spawn(shell, [], {
          stdio: "inherit",
          env,
        });

        // Handle shell exit
        shellProcess.on("close", (code) => {
          console.log(`Shell exited with code ${code}`);
          process.exit(code || 0);
        });
      } catch (error) {
        console.error((error as Error).message);
        process.exit(1);
      }
    });
}
