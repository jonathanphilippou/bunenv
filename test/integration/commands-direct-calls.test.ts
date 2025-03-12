import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { getGlobalVersionFile } from "../../src/core/paths";
import {
  isVersionInstalled,
  setGlobalVersion,
  setLocalVersion,
} from "../../src/versions/version-manager";

/**
 * Direct CLI Function Tests
 *
 * These tests directly call the core functions that the CLI commands use,
 * bypassing the Commander interface entirely.
 */
describe("CLI Core Functions", () => {
  // Test environment setup
  let outputCapture: { stdout: string[]; stderr: string[] };
  const testVersion = "1.0.0";

  // Test directories
  let tempDir: string;
  let bunenvRoot: string;
  let versionsDir: string;

  // Original environment
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalProcessExit = process.exit;
  const originalEnv = { ...process.env };
  const originalCwd = process.cwd();

  // Set up the test environment
  beforeEach(async () => {
    // Create a temporary test directory
    tempDir = path.join(os.tmpdir(), `bunenv-test-${Date.now()}`);
    bunenvRoot = path.join(tempDir, ".bunenv");
    versionsDir = path.join(bunenvRoot, "versions");

    // Set environment variables
    process.env.BUNENV_ROOT = bunenvRoot;

    // Set up output capture
    outputCapture = { stdout: [], stderr: [] };
    console.log = (message: string) => {
      outputCapture.stdout.push(message);
    };
    console.error = (message: string) => {
      outputCapture.stderr.push(message);
    };

    // Mock process.exit
    process.exit = ((code = 0) => {
      throw new Error(`EXIT_${code}`);
    }) as any;

    // Create test directories in the real filesystem
    await fs.mkdir(versionsDir, { recursive: true });
    await fs.mkdir(path.join(versionsDir, testVersion, "bin"), {
      recursive: true,
    });

    // Create a mock bun binary
    const mockBunPath = path.join(versionsDir, testVersion, "bin", "bun");
    await fs.writeFile(mockBunPath, "#!/bin/sh\necho 'Mock Bun'");
    await fs.chmod(mockBunPath, 0o755);

    // Change to the temp directory
    process.chdir(tempDir);
  });

  // Clean up after each test
  afterEach(async () => {
    // Restore original environment
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    process.exit = originalProcessExit;
    process.env = { ...originalEnv };
    process.chdir(originalCwd);

    // Clean up test directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Warning: Failed to clean up test directory: ${tempDir}`);
    }
  });

  test("isVersionInstalled should detect installed versions", async () => {
    // Check if the test version is installed
    const installed = await isVersionInstalled(testVersion);
    expect(installed).toBe(true);

    // Check if a non-existent version is not installed
    const notInstalled = await isVersionInstalled("9.9.9");
    expect(notInstalled).toBe(false);
  });

  test("setGlobalVersion should create a global version file", async () => {
    // Set the global version
    await setGlobalVersion(testVersion);

    // Check that the file exists and contains the correct version
    const globalVersionFile = getGlobalVersionFile();
    const fileContent = await fs.readFile(globalVersionFile, "utf8");
    expect(fileContent.trim()).toBe(testVersion);
  });

  test("setLocalVersion should create a local version file", async () => {
    // Set the local version
    await setLocalVersion(testVersion);

    // Check that the file exists and contains the correct version
    const localVersionFile = path.join(process.cwd(), ".bun-version");
    const fileContent = await fs.readFile(localVersionFile, "utf8");
    expect(fileContent.trim()).toBe(testVersion);
  });
});
