import { describe, expect, mock, test } from "bun:test";
import fs from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { getBunenvRoot, getVersionsDir } from "../src/core/paths";
import {
  getBunPath,
  isVersionInstalled,
} from "../src/versions/version-manager";

describe("Version Manager", () => {
  // Check paths are set correctly
  test("getBunenvRoot should be set to ~/.bunenv by default", () => {
    const bunenvRoot = getBunenvRoot();
    expect(bunenvRoot).toBe(path.join(homedir(), ".bunenv"));
  });

  test("getVersionsDir should be inside getBunenvRoot", () => {
    const bunenvRoot = getBunenvRoot();
    const versionsDir = getVersionsDir();
    expect(versionsDir).toBe(path.join(bunenvRoot, "versions"));
  });

  // Test getting Bun path
  test("getBunPath should return the correct path", () => {
    const version = "1.0.0";
    const versionsDir = getVersionsDir();
    const expected = path.join(versionsDir, version, "bin", "bun");
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
