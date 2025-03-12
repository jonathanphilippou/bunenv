/**
 * File System Utilities
 * Provides consistent file system operations with error handling and convenience methods
 */
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Check if a file or directory exists
 * @param filePath Path to the file or directory
 * @returns True if the file or directory exists, false otherwise
 */
export async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read a file and return its content
 * @param filePath Path to the file
 * @returns File content as string, or null if the file doesn't exist or can't be read
 */
export async function readFile(filePath: string): Promise<string | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return content.trim();
  } catch {
    return null;
  }
}

/**
 * Write content to a file
 * @param filePath Path to the file
 * @param content Content to write
 * @throws Error if writing fails
 */
export async function writeFile(
  filePath: string,
  content: string
): Promise<void> {
  try {
    await fs.writeFile(filePath, content);
  } catch (err) {
    throw new Error(`Failed to write file: ${(err as Error).message}`);
  }
}

/**
 * Create a directory and all parent directories if they don't exist
 * @param dirPath Path to the directory
 * @throws Error if directory creation fails
 */
export async function createDirectory(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    throw new Error(`Failed to create directory: ${(err as Error).message}`);
  }
}

/**
 * Find a file by traversing up the directory tree
 * @param startDir Directory to start the search from
 * @param fileName Name of the file to find
 * @returns Path to the file if found, or null if not found
 */
export async function findUpwards(
  startDir: string,
  fileName: string
): Promise<string | null> {
  let currentDir = startDir;

  // Continue looking upward until we reach the root directory
  while (true) {
    const filePath = path.join(currentDir, fileName);

    try {
      await fs.access(filePath, fs.constants.R_OK);
      return filePath;
    } catch (error) {
      // File doesn't exist or isn't readable, move up a directory
      const parentDir = path.dirname(currentDir);

      // If we've reached the root directory, stop looking
      if (parentDir === currentDir) {
        return null;
      }

      currentDir = parentDir;
    }
  }
}

/**
 * Delete a file if it exists
 * @param filePath Path to the file
 * @returns True if the file was deleted, false if it didn't exist
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      // File doesn't exist
      return false;
    }
    throw error;
  }
}

/**
 * Delete a directory and all its contents recursively
 * @param dirPath Path to the directory
 * @returns True if the directory was deleted, false if it didn't exist
 */
export async function deleteDirectory(dirPath: string): Promise<boolean> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      // Directory doesn't exist
      return false;
    }
    throw error;
  }
}

/**
 * Get all files in a directory (non-recursive)
 * @param dirPath Path to the directory
 * @returns Array of file names (not full paths)
 */
export async function listFiles(dirPath: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      // Directory doesn't exist
      return [];
    }
    throw error;
  }
}

/**
 * Ensure a directory exists, creating it if necessary
 * @param dirPath Path to the directory
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  if (!(await exists(dirPath))) {
    await createDirectory(dirPath);
  }
}
