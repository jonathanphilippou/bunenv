import { beforeEach, describe, expect, test } from "bun:test";
import { createMockFS, mockEnv } from "../../utils/mock-fs";

describe("MockFS", () => {
  let mockFS: ReturnType<typeof createMockFS>;

  beforeEach(() => {
    mockFS = createMockFS();
  });

  test("should create an empty filesystem", () => {
    expect(mockFS.exists("/")).toBe(true);
    expect(mockFS.isDirectory("/")).toBe(true);
    expect(mockFS.readdir("/")).toEqual([]);
  });

  test("should create files and directories", () => {
    // Create a directory
    mockFS.mkdir("/test");
    expect(mockFS.exists("/test")).toBe(true);
    expect(mockFS.isDirectory("/test")).toBe(true);

    // Create a file
    mockFS.writeFile("/test/file.txt", "Hello, World!");
    expect(mockFS.exists("/test/file.txt")).toBe(true);
    expect(mockFS.isFile("/test/file.txt")).toBe(true);
    expect(mockFS.readFile("/test/file.txt", "utf-8")).toBe("Hello, World!");

    // Directory should contain the file
    expect(mockFS.readdir("/test")).toEqual(["file.txt"]);
  });

  test("should create directories recursively", () => {
    mockFS.mkdirp("/a/b/c");
    expect(mockFS.exists("/a")).toBe(true);
    expect(mockFS.exists("/a/b")).toBe(true);
    expect(mockFS.exists("/a/b/c")).toBe(true);
    expect(mockFS.isDirectory("/a/b/c")).toBe(true);
  });

  test("should handle relative paths based on current directory", () => {
    mockFS.mkdir("/test");
    mockFS.chdir("/test");
    expect(mockFS.getcwd()).toBe("/test");

    mockFS.writeFile("file.txt", "content");
    expect(mockFS.exists("/test/file.txt")).toBe(true);
    expect(mockFS.readFile("file.txt", "utf-8")).toBe("content");
  });

  test("should throw when file operations fail", () => {
    // Reading non-existent file
    expect(() => mockFS.readFile("/nonexistent")).toThrow();

    // Creating directory when parent doesn't exist
    expect(() => mockFS.mkdir("/a/b")).toThrow();

    // Writing to a directory
    mockFS.mkdir("/dir");
    expect(() => mockFS.writeFile("/dir", "content")).toThrow();
  });

  test("should delete files and directories", () => {
    // Setup
    mockFS.mkdir("/test");
    mockFS.writeFile("/test/file.txt", "content");

    // Delete file
    mockFS.unlink("/test/file.txt");
    expect(mockFS.exists("/test/file.txt")).toBe(false);
    expect(mockFS.readdir("/test")).toEqual([]);

    // Delete directory
    mockFS.rmdir("/test");
    expect(mockFS.exists("/test")).toBe(false);
  });

  test("should fail to delete non-empty directory without recursive flag", () => {
    mockFS.mkdir("/test");
    mockFS.writeFile("/test/file.txt", "content");

    expect(() => mockFS.rmdir("/test")).toThrow();

    // With recursive flag
    mockFS.rmdir("/test", true);
    expect(mockFS.exists("/test")).toBe(false);
  });

  test("should initialize with provided files", () => {
    const mockFSWithFiles = createMockFS({
      "/a/b/file1.txt": "content1",
      "/a/file2.txt": "content2",
    });

    expect(mockFSWithFiles.exists("/a")).toBe(true);
    expect(mockFSWithFiles.exists("/a/b")).toBe(true);
    expect(mockFSWithFiles.exists("/a/b/file1.txt")).toBe(true);
    expect(mockFSWithFiles.exists("/a/file2.txt")).toBe(true);

    expect(mockFSWithFiles.readFile("/a/b/file1.txt", "utf-8")).toBe(
      "content1"
    );
    expect(mockFSWithFiles.readFile("/a/file2.txt", "utf-8")).toBe("content2");
  });

  test("should provide promise-based API", async () => {
    const fs = mockFS.promises();

    await fs.mkdir("/test", { recursive: true });
    await fs.writeFile("/test/file.txt", "async content");

    const content = await fs.readFile("/test/file.txt", { encoding: "utf-8" });
    expect(content).toBe("async content");

    const stat = await fs.stat("/test/file.txt");
    expect(stat.isFile()).toBe(true);

    const files = await fs.readdir("/test");
    expect(files).toEqual(["file.txt"]);

    await fs.unlink("/test/file.txt");
    expect(await fs.exists("/test/file.txt")).toBe(false);
  });
});

describe("mockEnv", () => {
  test("should mock environment variables", () => {
    // Set a test value we can confirm changes
    const testVarName = "TEST_VAR_FOR_MOCK_TEST";
    process.env[testVarName] = "original";

    const mock = mockEnv({
      [testVarName]: "mocked value",
      NEW_VAR: "new value",
    });

    expect(process.env[testVarName]).toBe("mocked value");
    expect(process.env.NEW_VAR).toBe("new value");

    mock.restore();

    // After restore, it should go back to the original value
    expect(process.env[testVarName]).toBe("original");
    expect(process.env.NEW_VAR).toBeUndefined();

    // Clean up
    delete process.env[testVarName];
  });

  test("should unset environment variables", () => {
    // Set a value we can unset
    const testVarName = "TO_UNSET_FOR_TEST";
    process.env[testVarName] = "value";

    const mock = mockEnv({
      [testVarName]: undefined,
    });

    expect(process.env[testVarName]).toBeUndefined();

    mock.restore();

    expect(process.env[testVarName]).toBe("value");

    // Clean up
    delete process.env[testVarName];
  });
});
