#!/usr/bin/env bun
/**
 * bunenv: A version manager for Bun
 */

import { program } from "commander";
import { version } from "../package.json";

// Import commands
import { globalCommand } from "./cli/global";
import { initCommand } from "./cli/init";
import { installCommand } from "./cli/install";
import { listCommand } from "./cli/list";
import { localCommand } from "./cli/local";
import { rehashCommand } from "./cli/rehash";
import { shellCommand } from "./cli/shell";
import { versionCommand } from "./cli/version";

// Setup the CLI program
program
  .name("bunenv")
  .description("A version manager for Bun, inspired by rbenv and pyenv")
  .version(version);

// Register commands
globalCommand(program);
localCommand(program);
installCommand(program);
listCommand(program);
versionCommand(program);
rehashCommand(program);
shellCommand(program);
initCommand(program);

// Parse command line arguments
program.parse(process.argv);

// If no arguments, show help
if (process.argv.length === 2) {
  program.help();
}
