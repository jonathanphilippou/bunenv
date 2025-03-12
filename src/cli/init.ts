import { Command } from "commander";
import { getShellType } from "../core/environment";
import { getShimsDir } from "../core/paths";
import { info, logError } from "./utils/output";

/**
 * Configures the init command for the CLI
 *
 * @param program - Commander program instance
 */
export function initCommand(program: Command): void {
  program
    .command("init")
    .description("Configure shell integration for bunenv")
    .option("-s, --shell <type>", "Specify shell type (bash, zsh, fish)", "")
    .action(async (options) => {
      try {
        // Detect shell if not specified
        let shell = options.shell || process.env.SHELL || "";
        if (shell) {
          // Extract the shell name from the path
          shell = shell.split("/").pop() || "";
        }

        // Use environment detection if not explicitly specified
        if (!options.shell) {
          shell = getShellType();
        }

        // Generate the appropriate shell script
        let script = "";
        switch (shell) {
          case "fish":
            script = generateFishScript();
            break;
          case "zsh":
            script = generateZshScript();
            break;
          case "bash":
          default:
            script = generateBashScript();
        }

        // Output the script to stdout
        info(script);
      } catch (error) {
        logError(
          "Failed to generate shell initialization script",
          error as Error
        );
        process.exit(1);
      }
    });
}

/**
 * Generates shell integration script for Bash
 */
function generateBashScript(): string {
  return `# bunenv shell integration
export PATH="${getShimsDir()}:$PATH"
export BUNENV_ROOT="$HOME/.bunenv"

bunenv_init() {
  command bunenv rehash 2>/dev/null
}

# Initialize bunenv
bunenv_init
`;
}

/**
 * Generates shell integration script for Zsh
 */
function generateZshScript(): string {
  return `# bunenv shell integration
export PATH="${getShimsDir()}:$PATH"
export BUNENV_ROOT="$HOME/.bunenv"

bunenv_init() {
  command bunenv rehash 2>/dev/null
}

# Initialize bunenv
bunenv_init
`;
}

/**
 * Generates shell integration script for Fish
 */
function generateFishScript(): string {
  return `# bunenv shell integration
set -gx PATH "${getShimsDir()}" $PATH
set -gx BUNENV_ROOT "$HOME/.bunenv"

function bunenv_init
  command bunenv rehash 2>/dev/null
end

# Initialize bunenv
bunenv_init
`;
}
