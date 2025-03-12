# bunenv - Bun Version Manager

A version manager for Bun, inspired by rbenv and pyenv.

## Overview

bunenv allows you to:

- Install multiple versions of Bun
- Switch between them seamlessly based on your project
- Set a global or local (per-directory) Bun version
- Automatically switch versions when moving between projects

## Installation

### Install with Bun (recommended)

```bash
# Install bunenv globally
bun install -g bunenv

# Add bunenv to your shell
echo 'eval "$(bunenv init)"' >> ~/.zshrc  # or ~/.bashrc / ~/.profile

# Source your shell configuration
source ~/.zshrc  # or ~/.bashrc / ~/.profile
```

### Install from source

```bash
# Clone the repository
git clone https://github.com/jonathanphilippou/bunenv.git

# Navigate to the directory
cd bunenv

# Install dependencies
bun install

# Build the project
bun run build

# Add bunenv to your PATH
echo 'export PATH="$PWD/bin:$PATH"' >> ~/.zshrc  # or ~/.bashrc / ~/.profile

# Add shell integration
echo 'eval "$(bunenv init)"' >> ~/.zshrc  # or ~/.bashrc / ~/.profile

# Source your shell configuration
source ~/.zshrc  # or ~/.bashrc / ~/.profile
```

bunenv stores all versions and shims in `~/.bunenv` - this is standardized across all installations.

## Usage

### Installing Bun Versions

```bash
# Install a specific version
bunenv install 1.0.0
```

### Setting Global Bun Version

```bash
# Set the global Bun version
bunenv global 1.0.0

# Show the current global version
bunenv global
```

### Setting Local Bun Version

```bash
# Set the local Bun version (creates .bun-version file)
bunenv local 1.0.0

# Show the current local version
bunenv local
```

### Listing Installed Versions

```bash
# List all installed versions
bunenv list
# or
bunenv ls
```

### Checking Current Version

```bash
# Display the current active Bun version
bunenv version
```

### Using a Temporary Version

```bash
# Start a new shell with a specific Bun version
bunenv shell 1.0.0
```

### Rehashing Shims

```bash
# Rebuild Bun shim executables
bunenv rehash
```

## How It Works

bunenv works by creating a directory of shims in `~/.bunenv/shims`, which intercept Bun commands and redirect them to the appropriate version of Bun. When you run a Bun command, the bunenv shim checks for:

1. A `BUNENV_VERSION` environment variable
2. A `.bun-version` file in the current or parent directories
3. A `engines.bun` field in a `package.json` file
4. A global Bun version set with `bunenv global`

The selected Bun version is then executed from `~/.bunenv/versions/<version>/bin/bun`.

## License

MIT

# Using npm

npm install -g bunenv

# Using bun

bun install -g bunenv
