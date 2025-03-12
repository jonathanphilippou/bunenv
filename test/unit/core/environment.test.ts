import { afterEach, beforeEach, describe, expect, test } from "bun:test";

// Define the interface for the environment module
// This will guide our implementation
interface EnvironmentModule {
  getOperatingSystem(): "darwin" | "linux" | "windows" | "unknown";
  getArchitecture(): "x64" | "arm64" | "unknown";
  getShellType(): "bash" | "zsh" | "fish" | "powershell" | "cmd" | "unknown";
  isMacOS(): boolean;
  isLinux(): boolean;
  isWindows(): boolean;
  getDownloadPlatform(): string;
  getDownloadArchitecture(): string;
}

describe("Environment Module", () => {
  // Save original environment variables and platform
  const originalEnv = { ...process.env };
  const originalPlatform = process.platform;
  const originalArch = process.arch;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore environment after each test
    process.env = originalEnv;
  });

  test("getOperatingSystem should detect darwin", () => {
    // Mock process.platform
    const originalPlatform = process.platform;
    Object.defineProperty(process, "platform", {
      value: "darwin",
      configurable: true,
    });

    const { getOperatingSystem } = require("../../../src/core/environment");
    expect(getOperatingSystem()).toBe("darwin");

    // Restore original platform
    Object.defineProperty(process, "platform", {
      value: originalPlatform,
      configurable: true,
    });
  });

  test("getOperatingSystem should detect linux", () => {
    // Mock process.platform
    const originalPlatform = process.platform;
    Object.defineProperty(process, "platform", {
      value: "linux",
      configurable: true,
    });

    const { getOperatingSystem } = require("../../../src/core/environment");
    expect(getOperatingSystem()).toBe("linux");

    // Restore original platform
    Object.defineProperty(process, "platform", {
      value: originalPlatform,
      configurable: true,
    });
  });

  test("getOperatingSystem should detect windows", () => {
    // Mock process.platform
    const originalPlatform = process.platform;
    Object.defineProperty(process, "platform", {
      value: "win32",
      configurable: true,
    });

    const { getOperatingSystem } = require("../../../src/core/environment");
    expect(getOperatingSystem()).toBe("windows");

    // Restore original platform
    Object.defineProperty(process, "platform", {
      value: originalPlatform,
      configurable: true,
    });
  });

  test("getArchitecture should detect x64", () => {
    // Mock process.arch
    const originalArch = process.arch;
    Object.defineProperty(process, "arch", {
      value: "x64",
      configurable: true,
    });

    const { getArchitecture } = require("../../../src/core/environment");
    expect(getArchitecture()).toBe("x64");

    // Restore original arch
    Object.defineProperty(process, "arch", {
      value: originalArch,
      configurable: true,
    });
  });

  test("getArchitecture should detect arm64", () => {
    // Mock process.arch
    const originalArch = process.arch;
    Object.defineProperty(process, "arch", {
      value: "arm64",
      configurable: true,
    });

    const { getArchitecture } = require("../../../src/core/environment");
    expect(getArchitecture()).toBe("arm64");

    // Restore original arch
    Object.defineProperty(process, "arch", {
      value: originalArch,
      configurable: true,
    });
  });

  test("getShellType should detect bash", () => {
    // Mock shell environment
    const originalShell = process.env.SHELL;
    const originalZshVersion = process.env.ZSH_VERSION;

    process.env.SHELL = "/bin/bash";
    delete process.env.ZSH_VERSION;

    const { getShellType } = require("../../../src/core/environment");
    expect(getShellType()).toBe("bash");

    // Restore original environment
    process.env.SHELL = originalShell;
    if (originalZshVersion) {
      process.env.ZSH_VERSION = originalZshVersion;
    }
  });

  test("getShellType should detect zsh", () => {
    // Mock shell environment
    const originalShell = process.env.SHELL;
    const originalZshVersion = process.env.ZSH_VERSION;

    process.env.SHELL = "/bin/zsh";
    process.env.ZSH_VERSION = "5.8";

    const { getShellType } = require("../../../src/core/environment");
    expect(getShellType()).toBe("zsh");

    // Restore original environment
    process.env.SHELL = originalShell;
    if (originalZshVersion) {
      process.env.ZSH_VERSION = originalZshVersion;
    } else {
      delete process.env.ZSH_VERSION;
    }
  });

  test("getShellType should detect fish", () => {
    // Mock shell environment
    const originalShell = process.env.SHELL;

    process.env.SHELL = "/usr/bin/fish";

    const { getShellType } = require("../../../src/core/environment");
    expect(getShellType()).toBe("fish");

    // Restore original environment
    process.env.SHELL = originalShell;
  });

  test("isMacOS should return true on darwin", async () => {
    // Mock process.platform
    const originalPlatform = process.platform;
    Object.defineProperty(process, "platform", {
      value: "darwin",
      configurable: true,
    });

    const { isMacOS } = require("../../../src/core/environment");
    expect(isMacOS()).toBe(true);

    // Restore original platform
    Object.defineProperty(process, "platform", {
      value: originalPlatform,
      configurable: true,
    });
  });

  test("isLinux should return true on linux", () => {
    // Mock process.platform
    const originalPlatform = process.platform;
    Object.defineProperty(process, "platform", {
      value: "linux",
      configurable: true,
    });

    const { isLinux } = require("../../../src/core/environment");
    expect(isLinux()).toBe(true);

    // Restore original platform
    Object.defineProperty(process, "platform", {
      value: originalPlatform,
      configurable: true,
    });
  });

  test("isWindows should return true on win32", () => {
    // Mock process.platform
    const originalPlatform = process.platform;
    Object.defineProperty(process, "platform", {
      value: "win32",
      configurable: true,
    });

    const { isWindows } = require("../../../src/core/environment");
    expect(isWindows()).toBe(true);

    // Restore original platform
    Object.defineProperty(process, "platform", {
      value: originalPlatform,
      configurable: true,
    });
  });

  test("getDownloadPlatform should format platform for download URL", () => {
    // Test for darwin
    const originalPlatform = process.platform;

    // Test darwin
    Object.defineProperty(process, "platform", {
      value: "darwin",
      configurable: true,
    });

    let { getDownloadPlatform } = require("../../../src/core/environment");
    expect(getDownloadPlatform()).toBe("darwin");

    // Test linux
    Object.defineProperty(process, "platform", {
      value: "linux",
      configurable: true,
    });

    // Clear require cache to reload the module with new platform
    delete require.cache[require.resolve("../../../src/core/environment")];
    getDownloadPlatform =
      require("../../../src/core/environment").getDownloadPlatform;
    expect(getDownloadPlatform()).toBe("linux");

    // Test windows
    Object.defineProperty(process, "platform", {
      value: "win32",
      configurable: true,
    });

    // Clear require cache to reload the module with new platform
    delete require.cache[require.resolve("../../../src/core/environment")];
    getDownloadPlatform =
      require("../../../src/core/environment").getDownloadPlatform;
    expect(getDownloadPlatform()).toBe("windows");

    // Restore original platform
    Object.defineProperty(process, "platform", {
      value: originalPlatform,
      configurable: true,
    });
  });

  test("getDownloadArchitecture should format architecture for download URL", () => {
    // Save original architecture
    const originalArch = process.arch;

    // Test x64
    Object.defineProperty(process, "arch", {
      value: "x64",
      configurable: true,
    });

    let { getDownloadArchitecture } = require("../../../src/core/environment");
    expect(getDownloadArchitecture()).toBe("x64");

    // Test arm64
    Object.defineProperty(process, "arch", {
      value: "arm64",
      configurable: true,
    });

    // Clear require cache to reload the module with new architecture
    delete require.cache[require.resolve("../../../src/core/environment")];
    getDownloadArchitecture =
      require("../../../src/core/environment").getDownloadArchitecture;
    expect(getDownloadArchitecture()).toBe("aarch64");

    // Restore original architecture
    Object.defineProperty(process, "arch", {
      value: originalArch,
      configurable: true,
    });
  });
});
