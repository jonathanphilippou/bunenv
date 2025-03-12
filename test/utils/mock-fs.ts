/**
 * Mock Filesystem Utility
 *
 * This utility provides a virtual filesystem for testing purposes.
 * It allows tests to create, read, write, and delete files without touching the actual filesystem.
 */

import path from "node:path";

type MockFileContent = string | Buffer;

interface MockFileEntry {
  content: MockFileContent;
  isDirectory: boolean;
  mode: number;
  created: Date;
  modified: Date;
}

/**
 * MockFS provides a virtual filesystem for testing
 */
export class MockFS {
  private files: Map<string, MockFileEntry> = new Map();
  private cwd: string = "/";

  /**
   * Creates a new MockFS instance
   * @param initialFiles - Initial files to populate the filesystem with
   */
  constructor(initialFiles: Record<string, string | Buffer> = {}) {
    // Initialize with root directory
    this.mkdir("/");

    // Add initial files
    Object.entries(initialFiles).forEach(([filePath, content]) => {
      // Ensure the directory exists
      const dirPath = path.dirname(filePath);
      this.mkdirp(dirPath);

      // Create the file
      this.writeFile(filePath, content);
    });
  }

  /**
   * Set the current working directory
   * @param dir - Directory path
   */
  chdir(dir: string): void {
    const resolvedPath = this.resolvePath(dir);
    if (!this.exists(resolvedPath)) {
      throw new Error(`Directory doesn't exist: ${resolvedPath}`);
    }

    const fileEntry = this.files.get(resolvedPath);
    if (!fileEntry?.isDirectory) {
      throw new Error(`Not a directory: ${resolvedPath}`);
    }

    this.cwd = resolvedPath;
  }

  /**
   * Get the current working directory
   * @returns Current working directory
   */
  getcwd(): string {
    return this.cwd;
  }

  /**
   * Resolves a relative path against the current working directory
   * @param p - Path to resolve
   * @returns Absolute path
   */
  resolvePath(p: string): string {
    if (path.isAbsolute(p)) {
      return path.normalize(p);
    }
    return path.normalize(path.join(this.cwd, p));
  }

  /**
   * Check if a file or directory exists
   * @param p - Path to check
   * @returns True if the file or directory exists
   */
  exists(p: string): boolean {
    const resolvedPath = this.resolvePath(p);
    return this.files.has(resolvedPath);
  }

  /**
   * Check if a path is a directory
   * @param p - Path to check
   * @returns True if the path is a directory
   */
  isDirectory(p: string): boolean {
    const resolvedPath = this.resolvePath(p);
    const entry = this.files.get(resolvedPath);
    return entry ? entry.isDirectory : false;
  }

  /**
   * Check if a path is a file
   * @param p - Path to check
   * @returns True if the path is a file
   */
  isFile(p: string): boolean {
    const resolvedPath = this.resolvePath(p);
    const entry = this.files.get(resolvedPath);
    return entry ? !entry.isDirectory : false;
  }

  /**
   * Create a directory
   * @param p - Path to create
   * @param mode - Directory permissions (ignored in mock)
   */
  mkdir(p: string, mode: number = 0o777): void {
    const resolvedPath = this.resolvePath(p);

    if (this.exists(resolvedPath)) {
      if (this.isDirectory(resolvedPath)) {
        return; // Directory already exists
      }
      throw new Error(`File exists at path: ${resolvedPath}`);
    }

    // Ensure parent directory exists
    const parentDir = path.dirname(resolvedPath);
    if (parentDir !== resolvedPath && !this.exists(parentDir)) {
      throw new Error(`Parent directory doesn't exist: ${parentDir}`);
    }

    const now = new Date();
    this.files.set(resolvedPath, {
      content: "",
      isDirectory: true,
      mode,
      created: now,
      modified: now,
    });
  }

  /**
   * Create a directory and any parent directories that don't exist
   * @param p - Path to create
   * @param mode - Directory permissions (ignored in mock)
   */
  mkdirp(p: string, mode: number = 0o777): void {
    const resolvedPath = this.resolvePath(p);

    if (this.exists(resolvedPath)) {
      if (this.isDirectory(resolvedPath)) {
        return; // Directory already exists
      }
      throw new Error(`File exists at path: ${resolvedPath}`);
    }

    // Create parent directories
    const parts = resolvedPath.split("/").filter(Boolean);
    let currentPath = "/";

    for (const part of parts) {
      currentPath = path.join(currentPath, part);

      if (!this.exists(currentPath)) {
        this.mkdir(currentPath, mode);
      } else if (!this.isDirectory(currentPath)) {
        throw new Error(`Cannot create directory, file exists: ${currentPath}`);
      }
    }
  }

  /**
   * Read a file
   * @param p - Path to read
   * @param encoding - Encoding to use (if string is desired)
   * @returns File content
   */
  readFile(p: string, encoding?: "utf-8"): Buffer | string {
    const resolvedPath = this.resolvePath(p);

    if (!this.exists(resolvedPath)) {
      throw new Error(`No such file: ${resolvedPath}`);
    }

    if (this.isDirectory(resolvedPath)) {
      throw new Error(`Cannot read directory as file: ${resolvedPath}`);
    }

    const entry = this.files.get(resolvedPath)!;

    if (encoding === "utf-8" && Buffer.isBuffer(entry.content)) {
      return entry.content.toString("utf-8");
    }

    if (typeof entry.content === "string" && !encoding) {
      return Buffer.from(entry.content);
    }

    return entry.content;
  }

  /**
   * Write to a file
   * @param p - Path to write
   * @param content - Content to write
   * @param mode - File permissions (ignored in mock)
   */
  writeFile(p: string, content: MockFileContent, mode: number = 0o666): void {
    const resolvedPath = this.resolvePath(p);

    // Ensure parent directory exists
    const parentDir = path.dirname(resolvedPath);
    if (!this.exists(parentDir)) {
      this.mkdirp(parentDir);
    }

    if (this.exists(resolvedPath) && this.isDirectory(resolvedPath)) {
      throw new Error(`Cannot write to directory: ${resolvedPath}`);
    }

    const now = new Date();
    const created = this.files.has(resolvedPath)
      ? this.files.get(resolvedPath)!.created
      : now;

    this.files.set(resolvedPath, {
      content,
      isDirectory: false,
      mode,
      created,
      modified: now,
    });
  }

  /**
   * Delete a file
   * @param p - Path to delete
   */
  unlink(p: string): void {
    const resolvedPath = this.resolvePath(p);

    if (!this.exists(resolvedPath)) {
      throw new Error(`No such file: ${resolvedPath}`);
    }

    if (this.isDirectory(resolvedPath)) {
      throw new Error(`Cannot unlink directory: ${resolvedPath}`);
    }

    this.files.delete(resolvedPath);
  }

  /**
   * Delete a directory
   * @param p - Path to delete
   * @param recursive - Whether to delete recursively
   */
  rmdir(p: string, recursive: boolean = false): void {
    const resolvedPath = this.resolvePath(p);

    if (!this.exists(resolvedPath)) {
      throw new Error(`No such directory: ${resolvedPath}`);
    }

    if (!this.isDirectory(resolvedPath)) {
      throw new Error(`Not a directory: ${resolvedPath}`);
    }

    // Check if directory is empty
    const contents = this.readdir(resolvedPath);
    if (contents.length > 0 && !recursive) {
      throw new Error(`Directory not empty: ${resolvedPath}`);
    }

    if (recursive) {
      // Delete all contents recursively
      for (const item of contents) {
        const itemPath = path.join(resolvedPath, item);
        if (this.isDirectory(itemPath)) {
          this.rmdir(itemPath, true);
        } else {
          this.unlink(itemPath);
        }
      }
    }

    this.files.delete(resolvedPath);
  }

  /**
   * List directory contents
   * @param p - Path to list
   * @returns Array of file and directory names
   */
  readdir(p: string): string[] {
    const resolvedPath = this.resolvePath(p);

    if (!this.exists(resolvedPath)) {
      throw new Error(`No such directory: ${resolvedPath}`);
    }

    if (!this.isDirectory(resolvedPath)) {
      throw new Error(`Not a directory: ${resolvedPath}`);
    }

    const contents: string[] = [];
    const prefix = resolvedPath === "/" ? "/" : resolvedPath + "/";

    for (const filePath of this.files.keys()) {
      if (filePath === resolvedPath) continue;

      if (filePath.startsWith(prefix)) {
        const relativePath = filePath.slice(prefix.length);
        const topLevelItem = relativePath.split("/")[0];
        if (topLevelItem && !contents.includes(topLevelItem)) {
          contents.push(topLevelItem);
        }
      }
    }

    return contents;
  }

  /**
   * Get file stats
   * @param p - Path to get stats for
   * @returns File stats
   */
  stat(p: string): {
    isFile: () => boolean;
    isDirectory: () => boolean;
    mode: number;
    created: Date;
    modified: Date;
  } {
    const resolvedPath = this.resolvePath(p);

    if (!this.exists(resolvedPath)) {
      throw new Error(`No such file or directory: ${resolvedPath}`);
    }

    const entry = this.files.get(resolvedPath)!;

    return {
      isFile: () => !entry.isDirectory,
      isDirectory: () => entry.isDirectory,
      mode: entry.mode,
      created: entry.created,
      modified: entry.modified,
    };
  }

  /**
   * Clear all files and directories
   */
  reset(): void {
    this.files.clear();
    this.mkdir("/");
    this.cwd = "/";
  }

  /**
   * Get all files and directories
   * @returns Map of all files and directories
   */
  getAllFiles(): Map<string, MockFileEntry> {
    return new Map(this.files);
  }

  /**
   * Creates a Promise-based API that mirrors Node's fs/promises
   * @returns An object with async methods similar to fs/promises
   */
  promises() {
    const self = this;

    return {
      readFile: async (p: string, options?: { encoding?: string }) => {
        const encoding = options?.encoding as "utf-8" | undefined;
        return self.readFile(p, encoding);
      },

      writeFile: async (
        p: string,
        content: MockFileContent,
        options?: { mode?: number }
      ) => {
        const mode = options?.mode ?? 0o666;
        return self.writeFile(p, content, mode);
      },

      mkdir: async (
        p: string,
        options?: { recursive?: boolean; mode?: number }
      ) => {
        const { recursive = false, mode = 0o777 } = options || {};
        if (recursive) {
          return self.mkdirp(p, mode);
        }
        return self.mkdir(p, mode);
      },

      rmdir: async (p: string, options?: { recursive?: boolean }) => {
        const recursive = options?.recursive ?? false;
        return self.rmdir(p, recursive);
      },

      unlink: async (p: string) => {
        return self.unlink(p);
      },

      readdir: async (p: string) => {
        return self.readdir(p);
      },

      stat: async (p: string) => {
        return self.stat(p);
      },

      exists: async (p: string) => {
        return self.exists(p);
      },

      access: async (p: string) => {
        if (!self.exists(p)) {
          throw new Error(`ENOENT: no such file or directory, access '${p}'`);
        }
      },
    };
  }
}

/**
 * Creates a mock filesystem with the given initial files
 * @param initialFiles - Initial files to populate the filesystem with
 * @returns A MockFS instance
 */
export function createMockFS(
  initialFiles: Record<string, string | Buffer> = {}
): MockFS {
  return new MockFS(initialFiles);
}

/**
 * Creates a mock environment with the given environment variables
 * @param env - Environment variables to set
 * @returns An object with the original environment variables and a restore function
 */
export function mockEnv(env: Record<string, string | undefined>): {
  original: typeof process.env;
  restore: () => void;
} {
  const original = { ...process.env };

  Object.entries(env).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  });

  return {
    original,
    restore: () => {
      // Restore original environment
      process.env = original;
    },
  };
}
