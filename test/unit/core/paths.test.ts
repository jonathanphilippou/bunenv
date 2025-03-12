import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import os from "node:os";
import path from "node:path";

// Define the interface for the paths module
// This will guide our implementation
interface PathsModule {
  getBunenvRoot(): string;
  getVersionsDir(): string;
  getShimsDir(): string;
  getGlobalVersionFile(): string;
  getBunBinaryPath(version: string): string;
  getLocalVersionFileName(): string;
  normalizePath(filePath: string): string;
}

describe("Paths Module", () => {
  // Mock environment variables
  const originalEnv = { ...process.env };
  const mockHomedir = "/mock/home";

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };

    // Mock os.homedir
    spyOn(os, "homedir").mockImplementation(() => mockHomedir);
  });

  afterEach(() => {
    // Restore environment after each test
    process.env = originalEnv;
  });

  test("getBunenvRoot should use environment variable if set", () => {
    // We'll need to import the module dynamically to ensure it sees
    // the updated environment variables and mocks
    const customRoot = "/custom/bunenv/root";
    process.env.BUNENV_ROOT = customRoot;

    // Import our module (we'll implement it based on the test)
    const { getBunenvRoot } = require("../../../src/core/paths");

    // Test that our function respects environment variables
    expect(getBunenvRoot()).toBe(customRoot);
  });

  test("getBunenvRoot should default to ~/.bunenv", () => {
    // Clear any environment variable
    delete process.env.BUNENV_ROOT;

    // Import our module
    const { getBunenvRoot } = require("../../../src/core/paths");

    // Test the default value
    const expected = path.join(mockHomedir, ".bunenv");
    expect(getBunenvRoot()).toBe(expected);
  });

  test("getVersionsDir should return the versions subdirectory", () => {
    const {
      getVersionsDir,
      getBunenvRoot,
    } = require("../../../src/core/paths");

    const expected = path.join(getBunenvRoot(), "versions");
    expect(getVersionsDir()).toBe(expected);
  });

  test("getShimsDir should return the shims subdirectory", () => {
    const { getShimsDir, getBunenvRoot } = require("../../../src/core/paths");

    const expected = path.join(getBunenvRoot(), "shims");
    expect(getShimsDir()).toBe(expected);
  });

  test("getGlobalVersionFile should return the path to the global version file", () => {
    const {
      getGlobalVersionFile,
      getBunenvRoot,
    } = require("../../../src/core/paths");

    const expected = path.join(getBunenvRoot(), "version");
    expect(getGlobalVersionFile()).toBe(expected);
  });

  test("getBunBinaryPath should return the path to the bun binary for a given version", () => {
    const {
      getBunBinaryPath,
      getVersionsDir,
    } = require("../../../src/core/paths");

    const version = "1.0.0";
    const expected = path.join(getVersionsDir(), version, "bin", "bun");
    expect(getBunBinaryPath(version)).toBe(expected);
  });

  test("getLocalVersionFileName should return the name of the local version file", () => {
    const { getLocalVersionFileName } = require("../../../src/core/paths");

    expect(getLocalVersionFileName()).toBe(".bun-version");
  });

  test("normalizePath should standardize paths for cross-platform compatibility", () => {
    const { normalizePath } = require("../../../src/core/paths");

    // Test that backslashes are converted to forward slashes on Windows
    // and paths are otherwise normalized according to platform standards
    const testPath = path.join("foo", "bar", "..", "baz");
    const expected = path.normalize(testPath);

    expect(normalizePath(testPath)).toBe(expected);
  });
});
