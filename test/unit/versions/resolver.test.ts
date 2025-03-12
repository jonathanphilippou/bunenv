import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import path from "node:path";

// Mock the core modules
const mockGetLocalVersionFileName = mock(() => ".bun-version");
const mockGetGlobalVersionFile = mock(() => "/mock/home/.bunenv/version");
const mockNormalizePath = mock((p: string) => p);

// Mock the fs module
const mockReadFile = mock(async (path: string) => "");
const mockAccess = mock(async (path: string) => {});

// Create a mock for the paths module
mock.module("../../../src/core/paths", () => ({
  getLocalVersionFileName: mockGetLocalVersionFileName,
  getGlobalVersionFile: mockGetGlobalVersionFile,
  normalizePath: mockNormalizePath,
}));

// Create a mock for the config module
mock.module("../../../src/core/config", () => ({
  VERSION_ENV_VAR: "BUNENV_VERSION",
}));

// Create a mock for fs.promises
mock.module("node:fs/promises", () => ({
  readFile: mockReadFile,
  access: mockAccess,
  constants: {
    R_OK: 4,
  },
}));

// Mock the version manager
const mockListInstalledVersions = mock(async () => ["1.0.0", "1.1.0", "1.2.0"]);
mock.module("../../../src/versions/version-manager", () => ({
  listInstalledVersions: mockListInstalledVersions,
}));

// Import the resolver module directly
import * as resolver from "../../../src/versions/resolver";

describe("Version Resolver", () => {
  // Save original environment and working directory
  const originalEnv = { ...process.env };
  const originalCwd = process.cwd();

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };

    // Reset mocks
    mockGetLocalVersionFileName.mockClear();
    mockGetGlobalVersionFile.mockClear();
    mockNormalizePath.mockClear();
    mockReadFile.mockClear();
    mockAccess.mockClear();
    mockListInstalledVersions.mockClear();
  });

  afterEach(() => {
    // Restore environment after each test
    process.env = originalEnv;

    // Clear require cache
    delete require.cache[require.resolve("../../../src/versions/resolver")];
  });

  test("findVersionFile should find version file in current directory", async () => {
    // Set up mocks
    mockGetLocalVersionFileName.mockReturnValue(".bun-version");
    mockAccess.mockImplementation(async (filePath: string) => {
      if (filePath === path.join(process.cwd(), ".bun-version")) {
        return;
      }
      throw new Error("File not found");
    });

    // Test finding version file
    const result = await resolver.findVersionFile();

    expect(result).toBe(path.join(process.cwd(), ".bun-version"));
    expect(mockGetLocalVersionFileName).toHaveBeenCalled();
    expect(mockAccess).toHaveBeenCalled();
  });

  test("findVersionFile should find version file in parent directory", async () => {
    // Set up mocks
    const currentDir = process.cwd();
    const parentDir = path.dirname(currentDir);

    mockGetLocalVersionFileName.mockReturnValue(".bun-version");
    mockAccess.mockImplementation(async (filePath: string) => {
      if (filePath === path.join(parentDir, ".bun-version")) {
        return;
      }
      throw new Error("File not found");
    });

    // Test finding version file
    const result = await resolver.findVersionFile();

    expect(result).toBe(path.join(parentDir, ".bun-version"));
  });

  test("findVersionFile should return null if no version file exists", async () => {
    // Set up mocks
    mockGetLocalVersionFileName.mockReturnValue(".bun-version");
    mockAccess.mockImplementation(async () => {
      throw new Error("File not found");
    });

    // Test finding version file
    const result = await resolver.findVersionFile();

    expect(result).toBeNull();
  });

  test("readVersionFile should read and trim version file content", async () => {
    // Set up mocks
    mockReadFile.mockResolvedValue("1.0.0\n");

    // Test reading version file
    const result = await resolver.readVersionFile("/path/to/version/file");

    expect(result).toBe("1.0.0");
    expect(mockReadFile).toHaveBeenCalledWith("/path/to/version/file", "utf-8");
  });

  test("readVersionFile should return null for non-existent file", async () => {
    // Set up mocks
    mockReadFile.mockImplementation(async () => {
      throw new Error("File not found");
    });

    // Test reading version file
    const result = await resolver.readVersionFile("/path/to/non-existent/file");

    expect(result).toBeNull();
  });

  test("findVersionFromPackageJson should find version in package.json", async () => {
    // Set up mocks
    mockReadFile.mockImplementation(async (filePath: string) => {
      if (filePath.endsWith("package.json")) {
        return JSON.stringify({
          engines: {
            bun: "1.0.0",
          },
        });
      }
      throw new Error("File not found");
    });

    mockAccess.mockImplementation(async (filePath: string) => {
      if (filePath.endsWith("package.json")) {
        return;
      }
      throw new Error("File not found");
    });

    // Test finding version from package.json
    const result = await resolver.findVersionFromPackageJson();

    expect(result).toBe("1.0.0");
  });

  test("findVersionFromPackageJson should return null if no package.json exists", async () => {
    // Set up mocks
    mockAccess.mockImplementation(async () => {
      throw new Error("File not found");
    });

    // Test finding version from package.json
    const result = await resolver.findVersionFromPackageJson();

    expect(result).toBeNull();
  });

  test("findVersionFromPackageJson should return null if package.json has no engines.bun field", async () => {
    // Set up mocks
    mockReadFile.mockImplementation(async (filePath: string) => {
      if (filePath.endsWith("package.json")) {
        return JSON.stringify({
          name: "test-package",
        });
      }
      throw new Error("File not found");
    });

    mockAccess.mockImplementation(async (filePath: string) => {
      if (filePath.endsWith("package.json")) {
        return;
      }
      throw new Error("File not found");
    });

    // Test finding version from package.json
    const result = await resolver.findVersionFromPackageJson();

    expect(result).toBeNull();
  });

  test("resolveVersionRange should resolve semver range to specific version", async () => {
    // Test resolving version range
    const result = await resolver.resolveVersionRange("^1.0.0");

    expect(result).toBe("1.2.0"); // Should return the highest matching version
    expect(mockListInstalledVersions).toHaveBeenCalled();
  });

  test("resolveVersionRange should return original version if it's not a range", async () => {
    // Test resolving exact version
    const result = await resolver.resolveVersionRange("1.0.0");

    expect(result).toBe("1.0.0");
  });

  test("resolveVersionRange should handle 'latest' alias", async () => {
    // Test resolving 'latest' alias
    const result = await resolver.resolveVersionRange("latest");

    expect(result).toBe("1.2.0"); // Should return the highest version
    expect(mockListInstalledVersions).toHaveBeenCalled();
  });

  test("resolveVersion should prioritize environment variable", async () => {
    // Set up environment
    process.env.BUNENV_VERSION = "1.0.0";

    // Test resolving version
    const result = await resolver.resolveVersion();

    expect(result).toBe("1.0.0");
  });

  test("resolveVersion should use local version file if no environment variable", async () => {
    // Set up environment
    delete process.env.BUNENV_VERSION;

    // Set up mocks
    mockGetLocalVersionFileName.mockReturnValue(".bun-version");
    mockAccess.mockImplementation(async (filePath: string) => {
      if (filePath === path.join(process.cwd(), ".bun-version")) {
        return;
      }
      throw new Error("File not found");
    });

    mockReadFile.mockImplementation(async (filePath: string) => {
      if (filePath === path.join(process.cwd(), ".bun-version")) {
        return "1.1.0";
      }
      throw new Error("File not found");
    });

    // Test resolving version
    const result = await resolver.resolveVersion();

    expect(result).toBe("1.1.0");
  });

  test("resolveVersion should use package.json if no local version file", async () => {
    // Set up environment
    delete process.env.BUNENV_VERSION;

    // Set up mocks for version file (not found)
    mockGetLocalVersionFileName.mockReturnValue(".bun-version");
    mockAccess.mockImplementation(async (filePath: string) => {
      if (filePath.endsWith("package.json")) {
        return;
      }
      throw new Error("File not found");
    });

    // Set up mocks for package.json
    mockReadFile.mockImplementation(async (filePath: string) => {
      if (filePath.endsWith("package.json")) {
        return JSON.stringify({
          engines: {
            bun: "1.2.0",
          },
        });
      }
      throw new Error("File not found");
    });

    // Test resolving version
    const result = await resolver.resolveVersion();

    expect(result).toBe("1.2.0");
  });

  test("resolveVersion should use global version file as last resort", async () => {
    // Set up environment
    delete process.env.BUNENV_VERSION;

    // Set up mocks for local version file and package.json (not found)
    mockGetLocalVersionFileName.mockReturnValue(".bun-version");
    mockGetGlobalVersionFile.mockReturnValue("/mock/home/.bunenv/version");

    mockAccess.mockImplementation(async (filePath: string) => {
      if (filePath === "/mock/home/.bunenv/version") {
        return;
      }
      throw new Error("File not found");
    });

    // Set up mocks for global version file
    mockReadFile.mockImplementation(async (filePath: string) => {
      if (filePath === "/mock/home/.bunenv/version") {
        return "1.3.0";
      }
      throw new Error("File not found");
    });

    // Test resolving version
    const result = await resolver.resolveVersion();

    expect(result).toBe("1.3.0");
  });

  test("resolveVersion should return null if no version is found", async () => {
    // Set up environment
    delete process.env.BUNENV_VERSION;

    // Set up mocks (all sources not found)
    mockAccess.mockImplementation(async (filePath: string) => {
      // Make sure all file access attempts fail
      throw new Error("File not found");
    });

    // Make sure global version file access fails too
    mockGetGlobalVersionFile.mockReturnValue("/mock/home/.bunenv/version");
    mockReadFile.mockImplementation(async (filePath: string) => {
      // Make sure all file reads fail
      throw new Error("File not found");
    });

    // Test resolving version
    const result = await resolver.resolveVersion();

    expect(result).toBeNull();
  });
});
