import { describe, expect, mock, test } from "bun:test";
import fs from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import {
  BUNENV_ROOT,
  VERSIONS_DIR,
  getBunPath,
  isVersionInstalled,
} from "../src/versions/version-manager";

describe("Version Manager", () => {
  // Check paths are set correctly
  test("BUNENV_ROOT should be set to ~/.bunenv by default", () => {
    expect(BUNENV_ROOT).toBe(path.join(homedir(), ".bunenv"));
  });

  test("VERSIONS_DIR should be inside BUNENV_ROOT", () => {
    expect(VERSIONS_DIR).toBe(path.join(BUNENV_ROOT, "versions"));
  });

  // Test getting Bun path
  test("getBunPath should return the correct path", () => {
    const version = "1.0.0";
    const expected = path.join(VERSIONS_DIR, version, "bin", "bun");
    expect(getBunPath(version)).toBe(expected);
  });

  // Mock the fs.access function for testing isVersionInstalled
  test("isVersionInstalled should return true if version exists", async () => {
    const originalFsAccess = fs.access;

    // Mock fs.access to always succeed
    fs.access = mock(() => Promise.resolve());

    try {
      const result = await isVersionInstalled("1.0.0");
      expect(result).toBe(true);
    } finally {
      // Restore original fs.access
      fs.access = originalFsAccess;
    }
  });

  test("isVersionInstalled should return false if version does not exist", async () => {
    const originalFsAccess = fs.access;

    // Mock fs.access to always fail
    fs.access = mock(() => Promise.reject(new Error("File not found")));

    try {
      const result = await isVersionInstalled("1.0.0");
      expect(result).toBe(false);
    } finally {
      // Restore original fs.access
      fs.access = originalFsAccess;
    }
  });
});
