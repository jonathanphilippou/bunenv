import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

describe("Config Module", () => {
  // Save original environment
  const originalEnv = { ...process.env };

  // Mock the environment module
  const mockGetOperatingSystem = mock(() => "darwin");
  const mockGetArchitecture = mock(() => "x64");

  // Create a mock for the environment module
  mock.module("../../../src/core/environment", () => ({
    getOperatingSystem: mockGetOperatingSystem,
    getArchitecture: mockGetArchitecture,
  }));

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore environment after each test
    process.env = originalEnv;

    // Reset mocks
    mockGetOperatingSystem.mockClear();
    mockGetArchitecture.mockClear();
  });

  test("DEFAULT_VERSION should use environment variable if set", () => {
    // Set environment variable
    process.env.BUNENV_DEFAULT_VERSION = "1.2.3";

    // Clear require cache to reload the module with new environment
    delete require.cache[require.resolve("../../../src/core/config")];

    // Import the module
    const { DEFAULT_VERSION } = require("../../../src/core/config");

    // Test that it uses the environment variable
    expect(DEFAULT_VERSION).toBe("1.2.3");
  });

  test("DEFAULT_VERSION should default to 'latest' if environment variable not set", () => {
    // Clear environment variable
    delete process.env.BUNENV_DEFAULT_VERSION;

    // Clear require cache to reload the module with new environment
    delete require.cache[require.resolve("../../../src/core/config")];

    // Import the module
    const { DEFAULT_VERSION } = require("../../../src/core/config");

    // Test that it uses the default value
    expect(DEFAULT_VERSION).toBe("latest");
  });

  test("VERSION_ENV_VAR should be set to 'BUNENV_VERSION'", () => {
    const { VERSION_ENV_VAR } = require("../../../src/core/config");
    expect(VERSION_ENV_VAR).toBe("BUNENV_VERSION");
  });

  test("ROOT_ENV_VAR should be set to 'BUNENV_ROOT'", () => {
    const { ROOT_ENV_VAR } = require("../../../src/core/config");
    expect(ROOT_ENV_VAR).toBe("BUNENV_ROOT");
  });

  test("VERSION_FILE_NAME should be set to '.bun-version'", () => {
    const { VERSION_FILE_NAME } = require("../../../src/core/config");
    expect(VERSION_FILE_NAME).toBe(".bun-version");
  });

  test("getBunDownloadUrl should format URL correctly for macOS", () => {
    // Set up mocks
    mockGetOperatingSystem.mockReturnValue("darwin");
    mockGetArchitecture.mockReturnValue("x64");

    // Import the module
    const { getBunDownloadUrl } = require("../../../src/core/config");

    // Test URL formatting
    const version = "1.0.0";
    const url = getBunDownloadUrl(version);

    expect(url).toBe(
      "https://github.com/oven-sh/bun/releases/download/bun-v1.0.0/bun-darwin-x64.zip"
    );
    expect(mockGetOperatingSystem).toHaveBeenCalled();
    expect(mockGetArchitecture).toHaveBeenCalled();
  });

  test("getBunDownloadUrl should format URL correctly for Linux with ARM64", () => {
    // Set up mocks
    mockGetOperatingSystem.mockReturnValue("linux");
    mockGetArchitecture.mockReturnValue("arm64");

    // Clear require cache to reload the module with new mocks
    delete require.cache[require.resolve("../../../src/core/config")];

    // Import the module
    const { getBunDownloadUrl } = require("../../../src/core/config");

    // Test URL formatting
    const version = "1.0.0";
    const url = getBunDownloadUrl(version);

    expect(url).toBe(
      "https://github.com/oven-sh/bun/releases/download/bun-v1.0.0/bun-linux-aarch64.zip"
    );
  });

  test("getBunDownloadUrl should format URL correctly for Windows", () => {
    // Set up mocks
    mockGetOperatingSystem.mockReturnValue("windows");
    mockGetArchitecture.mockReturnValue("x64");

    // Clear require cache to reload the module with new mocks
    delete require.cache[require.resolve("../../../src/core/config")];

    // Import the module
    const { getBunDownloadUrl } = require("../../../src/core/config");

    // Test URL formatting
    const version = "1.0.0";
    const url = getBunDownloadUrl(version);

    expect(url).toBe(
      "https://github.com/oven-sh/bun/releases/download/bun-v1.0.0/bun-win-x64.zip"
    );
  });

  test("getConfig should return configuration object with defaults", () => {
    // Set environment variable
    process.env.BUNENV_DEFAULT_VERSION = "1.2.3";

    // Clear require cache to reload the module with new environment
    delete require.cache[require.resolve("../../../src/core/config")];

    // Import the module
    const { getConfig } = require("../../../src/core/config");

    // Test configuration object
    const config = getConfig();

    expect(config).toEqual({
      defaultVersion: "1.2.3",
      versionEnvVar: "BUNENV_VERSION",
      rootEnvVar: "BUNENV_ROOT",
      versionFileName: ".bun-version",
    });
  });
});
