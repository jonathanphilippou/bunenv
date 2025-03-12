/**
 * CLI Test Harness
 *
 * This utility allows testing CLI commands directly without spawning a process.
 * It mocks the necessary dependencies and provides a way to intercept stdout/stderr.
 */

import { Command } from "commander";
import { MockFS } from "./mock-fs";

// Mock the process.exit function without importing commander directly
const mockExit = (code = 0) => {
  throw new Error(`CLI_EXIT_${code}`);
};

// Import CLI commands
import { globalCommand } from "../../src/cli/global";
import { initCommand } from "../../src/cli/init";
import { installCommand } from "../../src/cli/install";
import { listCommand } from "../../src/cli/list";
import { localCommand } from "../../src/cli/local";
import { rehashCommand } from "../../src/cli/rehash";
import { shellCommand } from "../../src/cli/shell";
import { versionCommand } from "../../src/cli/version";

/**
 * OutputCapture captures console output and exit calls
 */
class OutputCapture {
  stdout: string[] = [];
  stderr: string[] = [];
  exitCode: number | null = null;

  constructor() {
    this.reset();
  }

  reset() {
    this.stdout = [];
    this.stderr = [];
    this.exitCode = null;
  }

  getStdout(): string {
    return this.stdout.join("\n");
  }

  getStderr(): string {
    return this.stderr.join("\n");
  }
}

/**
 * CLI Test Harness
 * Allows testing CLI commands in isolation
 */
export class CLIHarness {
  private mockProcess: {
    exit: (code?: number) => void;
    env: Record<string, string | undefined>;
    cwd: () => string;
  };
  private mockConsole: {
    log: (message: string) => void;
    error: (message: string) => void;
  };
  private program: Command;
  private output: OutputCapture;
  private mockFS: MockFS;
  private originalConsoleLog: typeof console.log;
  private originalConsoleError: typeof console.error;
  private originalProcessExit: typeof process.exit;
  private originalProcessEnv: typeof process.env;

  constructor(mockFS: MockFS) {
    this.mockFS = mockFS;
    this.output = new OutputCapture();

    // Save original console and process methods
    this.originalConsoleLog = console.log;
    this.originalConsoleError = console.error;
    this.originalProcessExit = process.exit;
    this.originalProcessEnv = { ...process.env };

    // Set up mock process
    this.mockProcess = {
      exit: (code = 0) => {
        this.output.exitCode = code;
        // Don't actually exit the process during testing
        throw new Error(`CLI_EXIT_${code}`);
      },
      env: { ...process.env },
      cwd: () => this.mockFS.getcwd(),
    };

    // Set up mock console
    this.mockConsole = {
      log: (message: string) => {
        this.output.stdout.push(message);
      },
      error: (message: string) => {
        this.output.stderr.push(message);
      },
    };

    // Create commander program
    this.program = new Command()
      .name("bunenv")
      .description("A version manager for Bun, inspired by rbenv and pyenv")
      .version("0.1.0-test");

    // Register commands
    globalCommand(this.program);
    localCommand(this.program);
    installCommand(this.program);
    listCommand(this.program);
    versionCommand(this.program);
    rehashCommand(this.program);
    shellCommand(this.program);
    initCommand(this.program);
  }

  /**
   * Install mocks into global objects
   */
  installMocks() {
    // Override console methods
    console.log = this.mockConsole.log;
    console.error = this.mockConsole.error;

    // Override process methods
    process.exit = this.mockProcess.exit as typeof process.exit;
    process.env = this.mockProcess.env;

    // Override process.cwd
    const originalCwd = process.cwd;
    process.cwd = this.mockProcess.cwd;

    return () => {
      process.cwd = originalCwd;
    };
  }

  /**
   * Restore original global objects
   */
  restoreMocks() {
    console.log = this.originalConsoleLog;
    console.error = this.originalConsoleError;
    process.exit = this.originalProcessExit;
    process.env = this.originalProcessEnv;
  }

  /**
   * Set environment variables for the mock process
   * @param env Environment variables to set
   */
  setEnv(env: Record<string, string | undefined>) {
    Object.entries(env).forEach(([key, value]) => {
      if (value === undefined) {
        delete this.mockProcess.env[key];
      } else {
        this.mockProcess.env[key] = value;
      }
    });
  }

  /**
   * Get the current environment variables
   * @returns Current environment variables
   */
  getEnv(): Record<string, string | undefined> {
    return this.mockProcess.env;
  }

  /**
   * Reset the output capture
   */
  resetOutput() {
    this.output.reset();
  }

  /**
   * Run a CLI command
   * @param args Command line arguments
   * @returns Output from the command
   */
  async run(args: string[] = []): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number | null;
  }> {
    this.resetOutput();

    const restoreCwd = this.installMocks();

    try {
      // Parse and execute command
      await this.program.parseAsync(["node", "bunenv", ...args], {
        from: "user",
      });

      // If we reach here, the command completed successfully
      if (this.output.exitCode === null) {
        this.output.exitCode = 0;
      }
    } catch (error) {
      // Special handling for process.exit calls
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage.startsWith("CLI_EXIT_")) {
        // This is a process.exit call
        const exitCode = parseInt(errorMessage.replace("CLI_EXIT_", ""), 10);
        this.output.exitCode = exitCode;
      } else {
        // This is a real error
        console.error(errorMessage);
        this.output.exitCode = 1;
      }
    } finally {
      restoreCwd();
      this.restoreMocks();
    }

    return {
      stdout: this.output.getStdout(),
      stderr: this.output.getStderr(),
      exitCode: this.output.exitCode,
    };
  }
}

/**
 * Create a CLI harness for testing
 * @param mockFS Mock filesystem to use
 * @returns A CLI harness
 */
export function createCLIHarness(mockFS: MockFS): CLIHarness {
  return new CLIHarness(mockFS);
}
