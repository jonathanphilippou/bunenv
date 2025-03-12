/**
 * CLI output utilities
 * Provides consistent formatting for command output
 */

/**
 * Log an informational message to the console
 * @param message The message to display
 */
export function info(message: string): void {
  console.log(message);
}

/**
 * Log a success message to the console
 * @param message The success message to display
 */
export function success(message: string): void {
  console.log(`✓ ${message}`);
}

/**
 * Log a warning message to the console
 * @param message The warning message to display
 */
export function warning(message: string): void {
  console.log(`⚠ ${message}`);
}

/**
 * Log an error message to the console
 * @param message The error message to display
 * @param error Optional error object for additional details
 */
export function logError(message: string, error?: Error): void {
  console.error(`✗ ${message}`);
  if (error && error.message) {
    console.error(`  ${error.message}`);
  }
}

/**
 * Format a list of items with consistent indentation
 * @param items The list of items to format
 * @param currentItem Optional current item to highlight
 * @returns Formatted list as a string
 */
export function formatList(items: string[], currentItem?: string): string {
  if (items.length === 0) {
    return "  No items found.";
  }

  return items
    .map((item) => {
      if (item === currentItem) {
        return `* ${item} (current)`;
      }
      return `  ${item}`;
    })
    .join("\n");
}

/**
 * Display a consistent error and exit the process
 * @param message The error message to display
 * @param error Optional error object
 * @param exitCode The process exit code (defaults to 1)
 * @param helpMessages Optional array of help messages to display
 */
export function errorAndExit(
  message: string,
  error?: Error,
  exitCode: number = 1,
  helpMessages?: string[]
): never {
  logError(message, error);

  // Display any additional help messages
  if (helpMessages && helpMessages.length > 0) {
    console.log(""); // Empty line for spacing
    helpMessages.forEach((msg) => console.log(msg));
  }

  return process.exit(exitCode) as never; // TypeScript needs this
}
