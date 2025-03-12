import fs, { chmod } from "node:fs/promises";
import path from "node:path";
import { SHIMS_DIR, VERSIONS_DIR } from "../versions/version-manager";

/**
 * Template for the shim executable
 * This will be written to each shim file
 */
const SHIM_TEMPLATE = `#!/usr/bin/env bash
set -e

# Extract executable name from the script path
exec_name="\${0##*/}"

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
        package_bun_version="\$(grep -o '\"bun\"\\s*:\\s*\"[^\"]*\"' "\${dir}/package.json" | grep -o '\"[^\"]*\"$' | tr -d '\"')"
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
  echo "bunenv: no Bun version specified. Set BUNENV_VERSION or add a .bun-version file." >&2
  exit 1
fi

# Check if the version is installed
version_bin="\${BUNENV_ROOT}/versions/\${bunenv_version}/bin/bun"
if [ ! -x "\${version_bin}" ]; then
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
 * Creates a shim executable in the shims directory
 *
 * @param shimName - Name of the shim to create
 * @returns Promise that resolves when the shim is created
 */
async function createShim(shimName: string): Promise<void> {
  const shimPath = path.join(SHIMS_DIR, shimName);

  try {
    // Write the shim executable
    await fs.writeFile(shimPath, SHIM_TEMPLATE);

    // Make the shim executable
    await chmod(shimPath, 0o755);
  } catch (error) {
    throw new Error(
      `Failed to create shim for ${shimName}: ${(error as Error).message}`
    );
  }
}

/**
 * Gets a list of all executables in all installed Bun versions
 *
 * @returns Array of executable names
 */
async function getAllExecutables(): Promise<string[]> {
  try {
    // Get all installed versions
    const versions = await fs.readdir(VERSIONS_DIR);
    const allExecutables = new Set<string>();

    // Always include the 'bun' executable
    allExecutables.add("bun");

    // For each installed version, check for executables
    await Promise.all(
      versions.map(async (version) => {
        const binDir = path.join(VERSIONS_DIR, version, "bin");
        try {
          const files = await fs.readdir(binDir);

          // Add each file to the set of executables
          for (const file of files) {
            const filePath = path.join(binDir, file);
            const stats = await fs.stat(filePath);

            // Only add if it's an executable
            if (stats.isFile() && stats.mode & 0o111) {
              allExecutables.add(file);
            }
          }
        } catch (error) {
          // Ignore errors if the bin directory doesn't exist
        }
      })
    );

    return Array.from(allExecutables);
  } catch (error) {
    // If VERSIONS_DIR doesn't exist, just return bun
    return ["bun"];
  }
}

/**
 * Recreates all shims for installed Bun versions
 *
 * @returns Promise that resolves when all shims are created
 */
export async function rehashShims(): Promise<void> {
  try {
    // Create the shims directory if it doesn't exist
    await fs.mkdir(SHIMS_DIR, { recursive: true });

    // Get all executables from all installed Bun versions
    const executables = await getAllExecutables();

    // Create a shim for each executable
    await Promise.all(executables.map(createShim));

    console.log(`Successfully rehashed ${executables.length} shims.`);
  } catch (error) {
    throw new Error(`Failed to rehash shims: ${(error as Error).message}`);
  }
}

/**
 * Sets up a shell environment with the correct PATH
 *
 * @param version - Bun version to use in the shell
 * @returns Environment variables to be set in the shell
 */
export function getShellEnv(version: string): Record<string, string> {
  return {
    BUNENV_VERSION: version,
    PATH: `${SHIMS_DIR}:${process.env.PATH || ""}`,
  };
}
