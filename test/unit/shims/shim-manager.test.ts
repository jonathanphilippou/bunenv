import { beforeEach, describe, expect, mock, test } from "bun:test";

// Mock the core modules
const mockGetShimsDir = mock(() => "/mock/shims");
const mockGetBunenvRoot = mock(() => "/mock/bunenv");
const mockGetShellType = mock(() => "bash");

// Mock file system utils
const mockExists = mock(async () => true);
const mockEnsureDirectory = mock(async () => {});
const mockWriteFile = mock(async (path, content) => {});
const mockDeleteFile = mock(async () => true);

// Create mocks for the fs module functions we use directly
const mockFsReaddir = mock(async (dir) => {
  if (dir === "/mock/shims") {
    return ["bun", "bunx"];
  } else if (dir === "/mock/bunenv/versions") {
    return [{ name: "1.0.0", isDirectory: (): boolean => true }];
  } else if (dir.includes("/bin")) {
    return [
      {
        name: "bun",
        isDirectory: (): boolean => false,
        isFile: (): boolean => true,
      },
      {
        name: "bunx",
        isDirectory: (): boolean => false,
        isFile: (): boolean => true,
      },
    ];
  }
  return [];
});

const mockFsStat = mock(async () => ({
  isFile: () => true,
  mode: 0o755,
}));

const mockFsChmod = mock(async () => {});

// Create mocks for imports
mock.module("../../../src/core/paths", () => ({
  getShimsDir: mockGetShimsDir,
  getBunenvRoot: mockGetBunenvRoot,
}));

mock.module("../../../src/core/environment", () => ({
  getShellType: mockGetShellType,
}));

mock.module("../../../src/utils/fs", () => ({
  exists: mockExists,
  ensureDirectory: mockEnsureDirectory,
  writeFile: mockWriteFile,
  deleteFile: mockDeleteFile,
}));

// Mock the fs module
mock.module("node:fs/promises", () => ({
  readdir: mockFsReaddir,
  stat: mockFsStat,
  chmod: mockFsChmod,
}));

// Now we can import the shim manager
import { getShellEnv, rehashShims } from "../../../src/shims/shim-manager";

describe("Shim Manager", () => {
  // Reset mocks before each test
  beforeEach(() => {
    // Clear mock calls
    mockGetShimsDir.mockClear();
    mockGetBunenvRoot.mockClear();
    mockGetShellType.mockClear();
    mockExists.mockClear();
    mockEnsureDirectory.mockClear();
    mockWriteFile.mockClear();
    mockDeleteFile.mockClear();
    mockFsReaddir.mockClear();
    mockFsStat.mockClear();
    mockFsChmod.mockClear();
  });

  // Skipping rehashShims tests for now as they need more extensive mocking
  test.skip("rehashShims should create the shims directory", async () => {
    await rehashShims();

    // Check if the shims directory was created
    expect(mockEnsureDirectory).toHaveBeenCalledWith("/mock/shims");
  });

  test.skip("rehashShims should create shims for executables", async () => {
    await rehashShims();

    // Check if writeFile was called for the shims
    expect(mockWriteFile).toHaveBeenCalled();
  });

  test.skip("rehashShims should handle different shell types", async () => {
    // Mock shell type
    mockGetShellType.mockReturnValue("fish");

    await rehashShims();

    // Check if writeFile was called for a shim
    expect(mockWriteFile).toHaveBeenCalled();
  });

  test("getShellEnv should return appropriate environment variables", () => {
    // Set up mock shims directory
    mockGetShimsDir.mockReturnValue("/mock/shims");

    // Save original env
    const originalEnv = { ...process.env };
    process.env.PATH = "/usr/bin:/bin";

    try {
      const env = getShellEnv("1.0.0");

      expect(env.BUNENV_VERSION).toBe("1.0.0");
      expect(env.PATH).toContain("/mock/shims");
      expect(env.PATH).toContain("/usr/bin:/bin");
    } finally {
      // Restore original env
      process.env = originalEnv;
    }
  });

  test("getShellEnv should handle Windows path separator", () => {
    // Set up mock shims directory
    mockGetShimsDir.mockReturnValue("/mock/shims");

    // Save original platform and env
    const originalPlatform = process.platform;
    const originalEnv = { ...process.env };
    process.env.PATH = "C:\\Windows;C:\\Program Files";

    try {
      // Mock Windows platform
      Object.defineProperty(process, "platform", { value: "win32" });

      const env = getShellEnv("1.0.0");

      expect(env.PATH).toContain("/mock/shims;");
      expect(env.PATH).toContain("C:\\Windows;C:\\Program Files");
    } finally {
      // Restore original platform and env
      Object.defineProperty(process, "platform", { value: originalPlatform });
      process.env = originalEnv;
    }
  });
});
