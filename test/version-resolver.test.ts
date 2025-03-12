import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  findVersionFile,
  readVersionFile,
  VERSION_FILE_NAME,
} from "../src/resolvers/version-resolver";

describe("Version Resolver", () => {
  // Create a temporary directory for testing
  const testDir = path.join(tmpdir(), "bunenv-test-" + Date.now());
  const subDir = path.join(testDir, "sub");
  const subSubDir = path.join(subDir, "subsub");

  // Setup: Create test directories
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(subDir, { recursive: true });
    await fs.mkdir(subSubDir, { recursive: true });
  });

  // Cleanup: Remove test directories
  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  test("findVersionFile should return null if no version file exists", async () => {
    const result = await findVersionFile(testDir);
    expect(result).toBeNull();
  });

  test("findVersionFile should find version file in current directory", async () => {
    const versionFilePath = path.join(testDir, VERSION_FILE_NAME);
    await fs.writeFile(versionFilePath, "1.0.0");

    const result = await findVersionFile(testDir);
    expect(result).toBe(versionFilePath);
  });

  test("findVersionFile should find version file in parent directory", async () => {
    const versionFilePath = path.join(testDir, VERSION_FILE_NAME);
    await fs.writeFile(versionFilePath, "1.0.0");

    const result = await findVersionFile(subDir);
    expect(result).toBe(versionFilePath);
  });

  test("findVersionFile should find version file in grandparent directory", async () => {
    const versionFilePath = path.join(testDir, VERSION_FILE_NAME);
    await fs.writeFile(versionFilePath, "1.0.0");

    const result = await findVersionFile(subSubDir);
    expect(result).toBe(versionFilePath);
  });

  test("readVersionFile should read and trim version file content", async () => {
    const versionFilePath = path.join(testDir, VERSION_FILE_NAME);
    await fs.writeFile(versionFilePath, "1.0.0\n");

    const result = await readVersionFile(versionFilePath);
    expect(result).toBe("1.0.0");
  });

  test("readVersionFile should return null for non-existent file", async () => {
    const versionFilePath = path.join(testDir, "non-existent-file");

    const result = await readVersionFile(versionFilePath);
    expect(result).toBeNull();
  });
});
