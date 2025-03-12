import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { promises as fs } from "node:fs";
import * as os from "node:os";
import path from "node:path";

import { getBunenvRoot } from "../../../src/core/paths";
import {
  isVersionInstalled,
  listInstalledVersions,
  setGlobalVersion,
  setLocalVersion,
} from "../../../src/versions/version-manager";

/**
 * These tests create a temporary bunenv root directory
 * and perform real operations on the file system.
 *
 * Note: These tests don't actually download Bun binaries,
 * they just simulate the structure created by the version manager.
 */
describe("Version Manager Component Tests", () => {
  // Create a temporary directory for our tests
  const tmpDir = path.join(os.tmpdir(), `bunenv-test-${Date.now()}`);
  const versionsDir = path.join(tmpDir, "versions");
  const originalEnv = { ...process.env };

  // Set up our test environment
  beforeAll(async () => {
    // Mock the BUNENV_ROOT environment variable
    process.env.BUNENV_ROOT = tmpDir;

    // Create the temporary directory structure
    await fs.mkdir(versionsDir, { recursive: true });

    // Mock version directories for "1.0.0" and "1.1.0"
    await fs.mkdir(path.join(versionsDir, "1.0.0", "bin"), { recursive: true });
    await fs.mkdir(path.join(versionsDir, "1.1.0", "bin"), { recursive: true });

    // Create mock bun binaries
    const mockBunBinary = "#!/bin/sh\necho 'Mock Bun binary'";
    await fs.writeFile(
      path.join(versionsDir, "1.0.0", "bin", "bun"),
      mockBunBinary
    );
    await fs.writeFile(
      path.join(versionsDir, "1.1.0", "bin", "bun"),
      mockBunBinary
    );

    // Make them executable
    await fs.chmod(path.join(versionsDir, "1.0.0", "bin", "bun"), 0o755);
    await fs.chmod(path.join(versionsDir, "1.1.0", "bin", "bun"), 0o755);
  });

  // Clean up after our tests
  afterAll(async () => {
    // Restore the original environment
    process.env = originalEnv;

    // Delete the temporary directory
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch (error) {
      console.error(`Could not clean up temporary directory: ${error}`);
    }
  });

  // Test listing versions
  test("listInstalledVersions should list all installed versions", async () => {
    const versions = await listInstalledVersions();
    expect(versions).toContain("1.0.0");
    expect(versions).toContain("1.1.0");
    expect(versions.length).toBe(2);
  });

  // Test checking if a version is installed
  test("isVersionInstalled should detect installed versions", async () => {
    expect(await isVersionInstalled("1.0.0")).toBe(true);
    expect(await isVersionInstalled("1.1.0")).toBe(true);
    expect(await isVersionInstalled("2.0.0")).toBe(false);
  });

  // Test setting the global version
  test("setGlobalVersion should create a global version file", async () => {
    await setGlobalVersion("1.0.0");

    // Check if the global version file exists and contains the correct version
    const versionFile = path.join(getBunenvRoot(), "version");
    const version = await fs.readFile(versionFile, "utf-8");

    expect(version.trim()).toBe("1.0.0");
  });

  // Test setting the local version
  test("setLocalVersion should create a local version file", async () => {
    // Override cwd to point to our temporary directory
    const originalCwd = process.cwd;
    process.cwd = () => tmpDir;

    try {
      await setLocalVersion("1.1.0");

      // Check if the local version file exists and contains the correct version
      const versionFile = path.join(tmpDir, ".bun-version");
      const version = await fs.readFile(versionFile, "utf-8");

      expect(version.trim()).toBe("1.1.0");
    } finally {
      // Restore the original cwd
      process.cwd = originalCwd;
    }
  });

  // Skip the installation test as it would try to download the actual binary
  test.skip("installVersion should install a new version", async () => {
    // This would actually try to download Bun, so we skip it
    // In a real test, you might want to mock the download or use a small test binary
  });
});
