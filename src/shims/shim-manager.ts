/**
 * Shim Manager Module
 * Responsible for creating and managing Bun shims
 */

import fs from "node:fs/promises";
import path from "node:path";
import { getShellType } from "../core/environment";
import { getBunenvRoot, getShimsDir } from "../core/paths";
import * as fsUtils from "../utils/fs";

/**
 * Template for Bash/Zsh shim scripts
 */
const BASH_SHIM_TEMPLATE = `#!/usr/bin/env bash
set -e

# Extract executable name from the script path
exec_name="\${0##*/}"

# Always bypass shim for bunenv command to avoid circular dependencies
if [ "\${exec_name}" = "bunenv" ]; then
  # Try to find the original bunenv executable
  system_bunenv="\${HOME}/.bun/bin/bunenv"
  if [ -x "\${system_bunenv}" ]; then
    exec "\${system_bunenv}" "\$@"
  else
    echo "bunenv: Could not find the bunenv executable. Please reinstall bunenv." >&2
    exit 1
  fi
fi

# Get the resolved bunenv root
if [ -z "\${BUNENV_ROOT}" ]; then
  BUNENV_ROOT="\${HOME}/.bunenv"
fi

# Resolve the Bun version to use
bunenv_version=""

# Check if BUNENV_VERSION is set
if [ -n "\${BUNENV_VERSION}" ]; then
  bunenv_version="\${BUNENV_VERSION}"
else
  # Check for local .bun-version file
  local_version_file=""
  dir="\$(pwd)"
  while [ "\${dir}" != "/" ]; do
    if [ -f "\${dir}/.bun-version" ]; then
      local_version_file="\${dir}/.bun-version"
      break
    fi
    dir="\$(dirname "\${dir}")"
  done

  # If local version file found, use it
  if [ -n "\${local_version_file}" ]; then
    bunenv_version="\$(cat "\${local_version_file}" | tr -d '[:space:]')"
  else
    # Check for package.json engines.bun
    dir="\$(pwd)"
    while [ "\${dir}" != "/" ]; do
      if [ -f "\${dir}/package.json" ]; then
        package_bun_version="\$(grep -o '\"bun\"\\s*:\\s*\"[^\"]*\"' "\${dir}/package.json" | grep -o '\"[^\"]*\"$' | tr -d '\"' 2>/dev/null)"
        if [ -n "\${package_bun_version}" ]; then
          bunenv_version="\${package_bun_version}"
          break
        fi
      fi
      dir="\$(dirname "\${dir}")"
    done

    # If no local or package.json version, use global
    if [ -z "\${bunenv_version}" ] && [ -f "\${BUNENV_ROOT}/version" ]; then
      bunenv_version="\$(cat "\${BUNENV_ROOT}/version" | tr -d '[:space:]')"
    fi
  fi
fi

# Check if we resolved a version
if [ -z "\${bunenv_version}" ]; then
  # If no version is resolved, but we have the system bun, use that as a fallback
  # This helps during initial setup or if bunenv's own command needs to run
  system_bun="\${HOME}/.bun/bin/bun"
  if [ -x "\${system_bun}" ] && [ "\${exec_name}" = "bun" ]; then
    # Version not installed, but system bun exists - use that
    echo "bunenv: warning: no version specified, using system bun instead." >&2
    exec "\${system_bun}" "\$@"
  else
    echo "bunenv: no Bun version specified. Set BUNENV_VERSION or add a .bun-version file." >&2
    exit 1
  fi
fi

# Check if the version is installed
version_bin="\${BUNENV_ROOT}/versions/\${bunenv_version}/bin/bun"
if [ ! -x "\${version_bin}" ]; then
  # If version not installed, try fallback to system bun for bun commands
  if [ "\${exec_name}" = "bun" ]; then
    system_bun="\${HOME}/.bun/bin/bun"
    if [ -x "\${system_bun}" ]; then
      # Version not installed, but system bun exists - use that
      echo "bunenv: warning: version '\${bunenv_version}' is not installed, using system bun instead." >&2
      exec "\${system_bun}" "\$@"
    fi
  fi
  
  echo "bunenv: version '\${bunenv_version}' is not installed. Run 'bunenv install \${bunenv_version}' to install it." >&2
  exit 1
fi

# Execute the command with the resolved Bun
if [ "\${exec_name}" = "bun" ]; then
  exec "\${version_bin}" "\$@"
else
  exec "\${version_bin}" "\${exec_name}" "\$@"
fi
`;

/**
 * Template for Fish shim scripts
 */
const FISH_SHIM_TEMPLATE = `#!/usr/bin/env fish

# Extract executable name from the script path
set exec_name (basename $0)

# Always bypass shim for bunenv command to avoid circular dependencies
if test "$exec_name" = "bunenv"
  # Try to find the original bunenv executable
  set system_bunenv "$HOME/.bun/bin/bunenv"
  if test -x "$system_bunenv"
    exec "$system_bunenv" $argv
  else
    echo "bunenv: Could not find the bunenv executable. Please reinstall bunenv." >&2
    exit 1
  end
end

# Get the resolved bunenv root
if test -z "$BUNENV_ROOT"
  set BUNENV_ROOT "$HOME/.bunenv"
end

# Resolve the Bun version to use
set bunenv_version ""

# Check if BUNENV_VERSION is set
if test -n "$BUNENV_VERSION"
  set bunenv_version "$BUNENV_VERSION"
else
  # Check for local .bun-version file
  set local_version_file ""
  set dir (pwd)
  while test "$dir" != "/"
    if test -f "$dir/.bun-version"
      set local_version_file "$dir/.bun-version"
      break
    end
    set dir (dirname "$dir")
  end

  # If local version file found, use it
  if test -n "$local_version_file"
    set bunenv_version (cat "$local_version_file" | string trim)
  else
    # Check for package.json engines.bun (simplified for fish)
    set dir (pwd)
    while test "$dir" != "/"
      if test -f "$dir/package.json"
        set package_bun_version (grep -o '"bun"\\s*:\\s*"[^"]*"' "$dir/package.json" | grep -o '"[^"]*"$' | tr -d '"' 2>/dev/null)
        if test -n "$package_bun_version"
          set bunenv_version "$package_bun_version"
          break
        end
      end
      set dir (dirname "$dir")
    end

    # If no local or package.json version, use global
    if test -z "$bunenv_version"; and test -f "$BUNENV_ROOT/version"
      set bunenv_version (cat "$BUNENV_ROOT/version" | string trim)
    end
  end
end

# Check if we resolved a version
if test -z "$bunenv_version"
  # Try to use system bun as fallback
  set system_bun "$HOME/.bun/bin/bun"
  if test -x "$system_bun"; and test "$exec_name" = "bun"
    echo "bunenv: warning: no version specified, using system bun instead." >&2
    exec "$system_bun" $argv
  else
    echo "bunenv: no Bun version specified. Set BUNENV_VERSION or add a .bun-version file." >&2
    exit 1
  end
end

# Check if the version is installed
set version_bin "$BUNENV_ROOT/versions/$bunenv_version/bin/bun"
if not test -x "$version_bin"
  # Try to use system bun as fallback
  if test "$exec_name" = "bun"
    set system_bun "$HOME/.bun/bin/bun"
    if test -x "$system_bun"
      echo "bunenv: warning: version '$bunenv_version' is not installed, using system bun instead." >&2
      exec "$system_bun" $argv
    end
  end
  
  echo "bunenv: version '$bunenv_version' is not installed. Run 'bunenv install $bunenv_version' to install it." >&2
  exit 1
end

# Execute the command with the resolved Bun
if test "$exec_name" = "bun"
  exec "$version_bin" $argv
else
  exec "$version_bin" "$exec_name" $argv
end
`;

/**
 * Template for Windows cmd shim scripts
 */
const CMD_SHIM_TEMPLATE = `@echo off
setlocal enableextensions

:: Extract executable name from the script path
for %%i in ("%~nx0") do set exec_name=%%~ni

:: Always bypass shim for bunenv command to avoid circular dependencies
if "%exec_name%"=="bunenv" (
  :: Try to find the original bunenv executable
  if exist "%USERPROFILE%\\.bun\\bin\\bunenv.cmd" (
    "%USERPROFILE%\\.bun\\bin\\bunenv.cmd" %*
    exit /b %errorlevel%
  ) else (
    echo bunenv: Could not find the bunenv executable. Please reinstall bunenv. 1>&2
    exit /b 1
  )
)

:: Get the resolved bunenv root
if "%BUNENV_ROOT%"=="" set BUNENV_ROOT=%USERPROFILE%\\.bunenv

:: Resolve the Bun version to use
set bunenv_version=

:: Check if BUNENV_VERSION is set
if not "%BUNENV_VERSION%"=="" (
  set bunenv_version=%BUNENV_VERSION%
) else (
  :: Check for local .bun-version file
  set dir=%CD%
  set local_version_file=
  :find_version_loop
  if exist "%dir%\\.bun-version" (
    set local_version_file=%dir%\\.bun-version
    goto :found_version_file
  )
  :: Move to parent directory
  for %%i in ("%dir%") do set parent=%%~dpi
  :: Remove trailing backslash
  if "%parent:~-1%"=="\\" set parent=%parent:~0,-1%
  :: If we've reached the root, stop
  if "%parent%"=="%dir%" goto :no_version_file
  set dir=%parent%
  goto :find_version_loop
  
  :found_version_file
  if not "%local_version_file%"=="" (
    for /f "usebackq tokens=*" %%i in ("%local_version_file%") do set bunenv_version=%%i
  )
  
  :no_version_file
  :: If no local version, check global
  if "%bunenv_version%"=="" (
    if exist "%BUNENV_ROOT%\\version" (
      for /f "usebackq tokens=*" %%i in ("%BUNENV_ROOT%\\version") do set bunenv_version=%%i
    )
  )
)

:: Check if we resolved a version
if "%bunenv_version%"=="" (
  :: Try to use system bun as fallback
  if "%exec_name%"=="bun" (
    if exist "%USERPROFILE%\\.bun\\bin\\bun.exe" (
      echo bunenv: warning: no version specified, using system bun instead. 1>&2
      "%USERPROFILE%\\.bun\\bin\\bun.exe" %*
      exit /b %errorlevel%
    )
  )
  
  echo bunenv: no Bun version specified. Set BUNENV_VERSION or add a .bun-version file. 1>&2
  exit /b 1
)

:: Check if the version is installed
set version_bin=%BUNENV_ROOT%\\versions\\%bunenv_version%\\bin\\bun.exe
if not exist "%version_bin%" (
  :: Try to use system bun as fallback
  if "%exec_name%"=="bun" (
    if exist "%USERPROFILE%\\.bun\\bin\\bun.exe" (
      echo bunenv: warning: version '%bunenv_version%' is not installed, using system bun instead. 1>&2
      "%USERPROFILE%\\.bun\\bin\\bun.exe" %*
      exit /b %errorlevel%
    )
  )
  
  echo bunenv: version '%bunenv_version%' is not installed. Run 'bunenv install %bunenv_version%' to install it. 1>&2
  exit /b 1
)

:: Execute the command with the resolved Bun
if "%exec_name%"=="bun" (
  "%version_bin%" %*
) else (
  "%version_bin%" "%exec_name%" %*
)

exit /b %errorlevel%
`;

/**
 * Create a shim script for a specific executable
 * @param shimName Name of the executable to create a shim for
 */
async function createShim(shimName: string): Promise<void> {
  const shimsDir = getShimsDir();
  await fsUtils.ensureDirectory(shimsDir);

  const shimPath = path.join(shimsDir, shimName);
  const shellType = getShellType();

  // Select the appropriate template based on shell type
  let shimTemplate: string;
  let fileExt = "";

  if (shellType === "fish") {
    shimTemplate = FISH_SHIM_TEMPLATE;
  } else if (shellType === "powershell" || shellType === "cmd") {
    shimTemplate = CMD_SHIM_TEMPLATE;
    fileExt = ".cmd"; // Add .cmd extension for Windows
  } else {
    // Default to bash for all other shells
    shimTemplate = BASH_SHIM_TEMPLATE;
  }

  // Write the shim script
  await fsUtils.writeFile(shimPath + fileExt, shimTemplate);

  // Make the shim executable on Unix-like systems
  if (shellType !== "powershell" && shellType !== "cmd") {
    await fs.chmod(shimPath, 0o755);
  }
}

/**
 * Get a list of all executable files from all installed Bun versions
 * @returns Array of executable names
 */
async function getAllExecutables(): Promise<string[]> {
  const bunenvRoot = getBunenvRoot();
  const versionsDir = path.join(bunenvRoot, "versions");

  try {
    // Ensure the versions directory exists
    await fsUtils.ensureDirectory(versionsDir);

    // Get all version directories
    const entries = await fs.readdir(versionsDir, { withFileTypes: true });
    const versionDirs = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(versionsDir, entry.name));

    // Find all executables in all versions' bin directories
    const executableSets = await Promise.all(
      versionDirs.map(async (versionDir) => {
        const binDir = path.join(versionDir, "bin");

        try {
          const binEntries = await fs.readdir(binDir, { withFileTypes: true });

          // On Windows we need to look for .exe files
          return binEntries
            .filter((entry) => {
              // On Unix-like systems, we consider executable files
              // On Windows, we look for .exe files
              if (process.platform === "win32") {
                return entry.isFile() && entry.name.endsWith(".exe");
              } else {
                try {
                  const stat = fs.stat(path.join(binDir, entry.name));
                  return (stat as any).mode & 0o111; // Check if file is executable
                } catch {
                  return false;
                }
              }
            })
            .map((entry) => entry.name.replace(/\.exe$/, "")); // Remove .exe extension
        } catch (error) {
          // If bin directory doesn't exist or can't be read, ignore
          return [];
        }
      })
    );

    // Combine all executables and remove duplicates
    const allExecutables = Array.from(new Set(executableSets.flat()));

    // Always include 'bun' in the list
    if (!allExecutables.includes("bun")) {
      allExecutables.push("bun");
    }

    return allExecutables;
  } catch (error) {
    console.error(`Error finding executables: ${(error as Error).message}`);
    // Return at least 'bun' as a fallback
    return ["bun"];
  }
}

/**
 * Rehash all shims by recreating them based on installed Bun versions
 */
export async function rehashShims(): Promise<void> {
  const shimsDir = getShimsDir();

  try {
    // Create shims directory if it doesn't exist
    await fsUtils.ensureDirectory(shimsDir);

    // Clean up old shims - first check if the directory exists and is readable
    try {
      const existingShims = await fs.readdir(shimsDir);
      await Promise.all(
        existingShims.map((shim) => {
          const shimPath = path.join(shimsDir, shim);
          return fsUtils.deleteFile(shimPath);
        })
      );
    } catch (error) {
      // If directory doesn't exist or can't be read, continue without cleaning
      console.error(
        `Warning: Could not clean shims directory: ${(error as Error).message}`
      );
    }

    // Get all executables from all installed versions
    const executables = await getAllExecutables();

    // Create shims for all executables
    await Promise.all(executables.map((executable) => createShim(executable)));

    console.log(`Generated ${executables.length} shims.`);
  } catch (error) {
    console.error(`Error rehashing shims: ${(error as Error).message}`);
    throw error;
  }
}

/**
 * Get environment variables for shell integration
 * @param version Bun version to use
 * @returns Environment variables for the shell
 */
export function getShellEnv(version: string): Record<string, string> {
  const env: Record<string, string> = {};

  // Set BUNENV_VERSION to the specified version
  env.BUNENV_VERSION = version;

  // Add shims directory to PATH if not already there
  const shimsDir = getShimsDir();
  const pathSeparator = process.platform === "win32" ? ";" : ":";

  // Only add to PATH if needed
  if (!process.env.PATH?.includes(shimsDir)) {
    env.PATH = shimsDir + pathSeparator + (process.env.PATH || "");
  }

  return env;
}
