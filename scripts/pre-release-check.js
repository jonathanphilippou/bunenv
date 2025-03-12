#!/usr/bin/env bun
/**
 * Pre-release check script - Verifies that everything is ready for release
 * - Checks package.json for required fields
 * - Ensures version in package.json matches the entry in CHANGELOG.md
 * - Verifies that build succeeds
 * - Makes sure all tests pass
 * - Checks that license file exists
 */

import { execSync } from "child_process";
import fs from "fs/promises";
import { exit } from "process";

// ANSI color codes for output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

// Tracks if any checks fail
let hasErrors = false;

async function main() {
  console.log(
    `${colors.bold}${colors.blue}Running pre-release checks...${colors.reset}\n`
  );

  await checkPackageJson();
  await checkChangelog();
  await checkLicense();
  await runTests();
  await runBuild();

  if (hasErrors) {
    console.log(
      `\n${colors.bold}${colors.red}Pre-release check failed. Please fix the issues above.${colors.reset}`
    );
    exit(1);
  } else {
    console.log(
      `\n${colors.bold}${colors.green}All pre-release checks passed! Ready to release.${colors.reset}`
    );
  }
}

async function checkPackageJson() {
  console.log(`${colors.cyan}Checking package.json...${colors.reset}`);

  try {
    const pkgData = await fs.readFile("package.json", "utf8");
    const pkg = JSON.parse(pkgData);

    // Required fields
    const requiredFields = [
      "name",
      "version",
      "description",
      "main",
      "type",
      "bin",
      "files",
      "scripts",
      "repository",
      "keywords",
      "author",
      "license",
      "bugs",
      "homepage",
    ];

    const missingFields = requiredFields.filter((field) => !pkg[field]);

    if (missingFields.length > 0) {
      console.log(
        `${colors.red}Error: Missing required fields in package.json: ${missingFields.join(", ")}${colors.reset}`
      );
      hasErrors = true;
    } else {
      console.log(
        `${colors.green}✓ All required fields present in package.json${colors.reset}`
      );
    }

    // Check if version is properly formatted
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(pkg.version)) {
      console.log(
        `${colors.red}Error: Version ${pkg.version} is not in the format x.y.z${colors.reset}`
      );
      hasErrors = true;
    } else {
      console.log(
        `${colors.green}✓ Version format is valid: ${pkg.version}${colors.reset}`
      );
    }

    return pkg.version;
  } catch (error) {
    console.log(
      `${colors.red}Error reading package.json: ${error.message}${colors.reset}`
    );
    hasErrors = true;
    return null;
  }
}

async function checkChangelog() {
  console.log(`\n${colors.cyan}Checking CHANGELOG.md...${colors.reset}`);

  try {
    const version = JSON.parse(
      await fs.readFile("package.json", "utf8")
    ).version;
    const changelog = await fs.readFile("CHANGELOG.md", "utf8");

    // Check if version exists in changelog
    if (!changelog.includes(`## [${version}]`)) {
      console.log(
        `${colors.red}Error: Version ${version} not found in CHANGELOG.md${colors.reset}`
      );
      hasErrors = true;
    } else {
      console.log(
        `${colors.green}✓ Version ${version} found in CHANGELOG.md${colors.reset}`
      );
    }

    // Check if Unreleased section is empty or prepared for next version
    if (
      changelog.includes("## [Unreleased]") &&
      changelog.split("## [Unreleased]")[1].split("\n\n")[0].trim() !== ""
    ) {
      console.log(
        `${colors.yellow}Warning: Unreleased section in CHANGELOG.md is not empty. Consider moving changes to version ${version}${colors.reset}`
      );
    } else {
      console.log(
        `${colors.green}✓ Unreleased section is prepared for next development cycle${colors.reset}`
      );
    }
  } catch (error) {
    console.log(
      `${colors.red}Error checking CHANGELOG.md: ${error.message}${colors.reset}`
    );
    hasErrors = true;
  }
}

async function checkLicense() {
  console.log(`\n${colors.cyan}Checking license...${colors.reset}`);

  try {
    await fs.access("LICENSE");
    console.log(`${colors.green}✓ LICENSE file exists${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}Error: LICENSE file not found${colors.reset}`);
    hasErrors = true;
  }
}

async function runTests() {
  console.log(`\n${colors.cyan}Running tests...${colors.reset}`);

  try {
    execSync("bun test", { stdio: "pipe" });
    console.log(`${colors.green}✓ All tests passed${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}Error: Tests failed${colors.reset}`);
    console.log(error.stdout.toString());
    hasErrors = true;
  }
}

async function runBuild() {
  console.log(`\n${colors.cyan}Testing build...${colors.reset}`);

  try {
    execSync("bun run build:prod", { stdio: "pipe" });
    console.log(`${colors.green}✓ Build completed successfully${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}Error: Build failed${colors.reset}`);
    console.log(error.stdout.toString());
    hasErrors = true;
  }
}

main().catch((error) => {
  console.error(
    `${colors.red}Unhandled error: ${error.message}${colors.reset}`
  );
  exit(1);
});
