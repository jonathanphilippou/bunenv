// This is a manual rehash script
const fs = require("fs");
const path = require("path");
const os = require("os");

const BUNENV_ROOT = path.join(os.homedir(), ".bunenv");
const SHIMS_DIR = path.join(BUNENV_ROOT, "shims");

const SHIM_TEMPLATE = `#!/usr/bin/env bash
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

# Special case: if version contains wildcards or ranges (like >=1.0.0), 
# directly use system bun as a fallback during transition
# This prevents chicken-and-egg problems when upgrading
if [[ "\${bunenv_version}" == *">"* || "\${bunenv_version}" == *"<"* || "\${bunenv_version}" == *"*"* ]]; then
  system_bun="\${HOME}/.bun/bin/bun"
  if [ -x "\${system_bun}" ] && [ "\${exec_name}" = "bun" ]; then
    # Wildcard version - fall back to system bun
    exec "\${system_bun}" "\$@"
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

// Create the shim file for bun
const shimPath = path.join(SHIMS_DIR, "bun");
fs.writeFileSync(shimPath, SHIM_TEMPLATE);
fs.chmodSync(shimPath, 0o755);

console.log("Successfully rebuilt the bun shim");
