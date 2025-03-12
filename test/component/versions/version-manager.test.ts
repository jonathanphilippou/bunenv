import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs/promises";
import path from "node:path";
import {
  getBunenvRoot,
  getGlobalVersionFile,
  getVersionsDir,
} from "../../../src/core/paths";
import {
  getBunPath,
  isVersionInstalled,
  listInstalledVersions,
  setGlobalVersion,
  setLocalVersion,
} from "../../../src/versions/version-manager";

// Skip these tests for now since we need better mocking tools
// We'll address them in TICKET-008: Comprehensive Testing
describe.skip("Version Manager Component Tests", () => {
  const testVersion1 = "1.0.0";
  const testVersion2 = "1.1.0";
  let tempDir: string;
  let bunenvRoot: string;
  let versionsDir: string;
  let originalCwd: string;

  // Set up test environment
  beforeEach(async () => {
    // Save original working directory
    originalCwd = process.cwd();

    // Create temp test directory
    bunenvRoot = getBunenvRoot();
    versionsDir = getVersionsDir();
    tempDir = path.dirname(bunenvRoot);

    await fs.mkdir(versionsDir, { recursive: true });

    // Create mock version directories
    await fs.mkdir(path.join(versionsDir, testVersion1, "bin"), {
      recursive: true,
    });
    await fs.mkdir(path.join(versionsDir, testVersion2, "bin"), {
      recursive: true,
    });

    // Create mock bun binaries
    await fs.writeFile(
      path.join(versionsDir, testVersion1, "bin", "bun"),
      "#!/bin/sh\necho 'Mock Bun 1.0.0'"
    );
    await fs.writeFile(
      path.join(versionsDir, testVersion2, "bin", "bun"),
      "#!/bin/sh\necho 'Mock Bun 1.1.0'"
    );

    // Change working directory to temp dir
    process.chdir(tempDir);
  });

  // Clean up test environment
  afterEach(async () => {
    // Restore original working directory
    process.chdir(originalCwd);

    // Remove temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Error cleaning up test directory: ${error}`);
    }
  });

  test("listInstalledVersions should list all installed versions", async () => {
    const versions = await listInstalledVersions();
    expect(versions).toContain(testVersion1);
    expect(versions).toContain(testVersion2);
    expect(versions.length).toBe(2);
  });

  test("isVersionInstalled should detect installed versions", async () => {
    expect(await isVersionInstalled(testVersion1)).toBe(true);
    expect(await isVersionInstalled("9.9.9")).toBe(false);
  });

  test("getBunPath should return the binary path", () => {
    const binPath = getBunPath(testVersion1);
    expect(binPath).toContain(testVersion1);
    expect(binPath).toContain("bin");
    expect(binPath).toContain("bun");
  });

  test("setGlobalVersion should create a global version file", async () => {
    // Ensure the global version file directory exists
    const globalVersionFile = getGlobalVersionFile();
    await fs.mkdir(path.dirname(globalVersionFile), { recursive: true });

    await setGlobalVersion(testVersion1);

    // Check that the file exists and contains the correct version
    const fileContent = await fs.readFile(globalVersionFile, "utf8");
    expect(fileContent.trim()).toBe(testVersion1);
  });

  test("setLocalVersion should create a local version file", async () => {
    const localVersionFile = path.join(process.cwd(), ".bun-version");

    await setLocalVersion(testVersion2);

    // Check that the file exists and contains the correct version
    const fileContent = await fs.readFile(localVersionFile, "utf8");
    expect(fileContent.trim()).toBe(testVersion2);
  });

  test.skip("installVersion should install a new version", async () => {
    // This test requires mocking HTTP requests and is out of scope for this component test
    // Will be implemented in integration tests
  });
});
