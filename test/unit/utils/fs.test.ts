import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

// We're going to test against an interface we'll define
// This will guide the implementation of our fs utilities
interface FsUtils {
  exists(filePath: string): Promise<boolean>;
  readFile(filePath: string): Promise<string | null>;
  writeFile(filePath: string, content: string): Promise<void>;
  createDirectory(dirPath: string): Promise<void>;
  findUpwards(startDir: string, fileName: string): Promise<string | null>;
}

// We'll implement this for tests now, but it will guide our actual implementation
const fsUtils: FsUtils = {
  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  },

  async readFile(filePath: string): Promise<string | null> {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return content.trim();
    } catch {
      return null;
    }
  },

  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      await fs.writeFile(filePath, content);
    } catch (err) {
      throw new Error(`Failed to write file: ${(err as Error).message}`);
    }
  },

  async createDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (err) {
      throw new Error(`Failed to create directory: ${(err as Error).message}`);
    }
  },

  async findUpwards(
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
  },
};

describe("File System Utilities", () => {
  const tempDir = path.join(tmpdir(), "bunenv-fs-utils-test-" + Date.now());
  const subDir = path.join(tempDir, "sub");
  const testFilePath = path.join(tempDir, "test.txt");
  const subDirFilePath = path.join(subDir, "subfile.txt");

  beforeEach(async () => {
    await fs.mkdir(tempDir, { recursive: true });
    await fs.mkdir(subDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test("exists returns true for existing files", async () => {
    await fs.writeFile(testFilePath, "test content");

    const result = await fsUtils.exists(testFilePath);
    expect(result).toBe(true);
  });

  test("exists returns false for non-existing files", async () => {
    const nonExistentFile = path.join(tempDir, "non-existent.txt");

    const result = await fsUtils.exists(nonExistentFile);
    expect(result).toBe(false);
  });

  test("readFile returns content for existing files", async () => {
    const content = "test content";
    await fs.writeFile(testFilePath, content);

    const result = await fsUtils.readFile(testFilePath);
    expect(result).toBe(content);
  });

  test("readFile returns null for non-existing files", async () => {
    const nonExistentFile = path.join(tempDir, "non-existent.txt");

    const result = await fsUtils.readFile(nonExistentFile);
    expect(result).toBeNull();
  });

  test("writeFile creates files with content", async () => {
    const content = "new content";

    await fsUtils.writeFile(testFilePath, content);

    const fileContent = await fs.readFile(testFilePath, "utf-8");
    expect(fileContent).toBe(content);
  });

  test("createDirectory creates nested directories", async () => {
    const nestedDir = path.join(tempDir, "nested1", "nested2");

    await fsUtils.createDirectory(nestedDir);

    const exists = await fsUtils.exists(nestedDir);
    expect(exists).toBe(true);
  });

  test("findUpwards finds file in current directory", async () => {
    const fileName = "findme.txt";
    const filePath = path.join(tempDir, fileName);
    await fs.writeFile(filePath, "content");

    const result = await fsUtils.findUpwards(tempDir, fileName);
    expect(result).toBe(filePath);
  });

  test("findUpwards finds file in parent directory", async () => {
    const fileName = "findme.txt";
    const filePath = path.join(tempDir, fileName);
    await fs.writeFile(filePath, "content");

    const result = await fsUtils.findUpwards(subDir, fileName);
    expect(result).toBe(filePath);
  });

  test("findUpwards returns null if file not found", async () => {
    const result = await fsUtils.findUpwards(tempDir, "non-existent.txt");
    expect(result).toBeNull();
  });
});
