import { Command } from "commander";
import { SHIMS_DIR } from "../versions/version-manager";

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
      // Detect shell if not specified
      let shell = options.shell || process.env.SHELL || "";
      if (shell) {
        // Extract the shell name from the path
        shell = shell.split("/").pop() || "";
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
      console.log(script);
    });
}

/**
 * Generates shell integration script for Bash
 */
function generateBashScript(): string {
  return `# bunenv shell integration
export PATH="${SHIMS_DIR}:$PATH"
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
export PATH="${SHIMS_DIR}:$PATH"
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
set -gx PATH "${SHIMS_DIR}" $PATH
set -gx BUNENV_ROOT "$HOME/.bunenv"

function bunenv_init
  command bunenv rehash 2>/dev/null
end

# Initialize bunenv
bunenv_init
`;
}
