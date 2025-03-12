import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

// Import the current version resolver
// Later we'll refactor this to use the new modules
import {
  findVersionFile,
  resolveVersion,
  VERSION_FILE_NAME,
} from "../../src/resolvers/version-resolver";

describe("Version Resolver Component", () => {
  // Create a temporary test directory structure
  const tempBaseDir = path.join(tmpdir(), "bunenv-version-test-" + Date.now());
  const projectDir = path.join(tempBaseDir, "test-project");
  const subDir = path.join(projectDir, "sub");
  const subSubDir = path.join(subDir, "subsub");

  // Save the original working directory and environment
  const originalCwd = process.cwd();
  const originalEnv = { ...process.env };

  beforeEach(async () => {
    // Create test directories
    await fs.mkdir(tempBaseDir, { recursive: true });
    await fs.mkdir(projectDir, { recursive: true });
    await fs.mkdir(subDir, { recursive: true });
    await fs.mkdir(subSubDir, { recursive: true });

    // Reset environment variables that might affect tests
    delete process.env.BUNENV_VERSION;
  });

  afterEach(async () => {
    // Cleanup
    process.chdir(originalCwd);
    process.env = { ...originalEnv };
    await fs.rm(tempBaseDir, { recursive: true, force: true });
  });

  test("findVersionFile should find version file in current directory", async () => {
    const versionFilePath = path.join(projectDir, VERSION_FILE_NAME);
    await fs.writeFile(versionFilePath, "1.0.0");

    const result = await findVersionFile(projectDir);
    expect(result).toBe(versionFilePath);
  });

  test("findVersionFile should find version file in parent directory", async () => {
    const versionFilePath = path.join(projectDir, VERSION_FILE_NAME);
    await fs.writeFile(versionFilePath, "1.0.0");

    const result = await findVersionFile(subDir);
    expect(result).toBe(versionFilePath);
  });

  test("findVersionFile should find version file in grandparent directory", async () => {
    const versionFilePath = path.join(projectDir, VERSION_FILE_NAME);
    await fs.writeFile(versionFilePath, "1.0.0");

    const result = await findVersionFile(subSubDir);
    expect(result).toBe(versionFilePath);
  });

  test("resolveVersion should prioritize BUNENV_VERSION env var", async () => {
    // Set up files
    await fs.writeFile(path.join(projectDir, VERSION_FILE_NAME), "1.0.0");

    // Set the environment variable
    process.env.BUNENV_VERSION = "2.0.0";

    // Change to the project directory for this test
    process.chdir(projectDir);

    // Resolve version
    const version = await resolveVersion();

    // Environment variable should take precedence
    expect(version).toBe("2.0.0");
  });

  test("resolveVersion should use local version file if available", async () => {
    // Set up the version file
    await fs.writeFile(path.join(projectDir, VERSION_FILE_NAME), "1.0.0");

    // Change to the project directory for this test
    process.chdir(projectDir);

    // Resolve version
    const version = await resolveVersion();

    // Should read from the local version file
    expect(version).toBe("1.0.0");
  });

  test("resolveVersion should look in package.json engines field", async () => {
    // Create a package.json with a bun version in engines
    const packageJson = {
      name: "test-project",
      engines: {
        bun: "1.2.0",
      },
    };

    await fs.writeFile(
      path.join(projectDir, "package.json"),
      JSON.stringify(packageJson, null, 2)
    );

    // Change to the project directory for this test
    process.chdir(projectDir);

    // Resolve version
    const version = await resolveVersion();

    // Should find the version from package.json
    expect(version).toBe("1.2.0");
  });

  // More advanced tests to be added as we refactor
  test.todo("resolveVersion should resolve semver ranges to specific versions");
  test.todo(
    "resolveVersion should fall back to system version when appropriate"
  );
});
