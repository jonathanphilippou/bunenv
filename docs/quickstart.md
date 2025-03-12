# Quick Start Guide

This guide will help you quickly get started with bunenv.

## Installation

### Using npm (recommended)

```bash
npm install -g bunenv
```

### Using bunx (no installation)

```bash
bunx bunenv
```

### Manual Installation

```bash
git clone https://github.com/jonathanphilippou/bunenv.git
cd bunenv
bun install
bun run build
npm link
```

## Shell Integration

To enable automatic version switching, add bunenv to your shell:

### Bash

Add to your `~/.bashrc`:

```bash
eval "$(bunenv init -)"
```

### Zsh

Add to your `~/.zshrc`:

```bash
eval "$(bunenv init -)"
```

### Fish

Add to your `~/.config/fish/config.fish`:

```fish
bunenv init - | source
```

## Basic Usage

### List Available Versions

```bash
bunenv list-remote
```

### Install a Specific Version

```bash
bunenv install 1.0.0
```

### Set Global Version

```bash
bunenv global 1.0.0
```

### Set Local Version (in current directory)

```bash
bunenv local 1.0.0
```

This creates a `.bun-version` file in the current directory.

### Check Current Version

```bash
bunenv version
```

### List Installed Versions

```bash
bunenv list
```

### Uninstall a Version

```bash
bunenv uninstall 1.0.0
```

## Project-specific Configuration

Create a `.bun-version` file in your project root:

```bash
echo "1.0.0" > .bun-version
```

With shell integration enabled, bunenv will automatically switch to this version when entering the directory.

## Advanced Usage

### Custom Installation Directory

By default, bunenv installs versions to `~/.bunenv/versions`. You can change this with:

```bash
export BUNENV_ROOT=/custom/path
```

Add this to your shell profile to make it permanent.

### Using a Proxy

If you're behind a proxy:

```bash
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
bunenv install <version>
```

### Skipping Verification

To skip checksum verification (not recommended):

```bash
bunenv install --no-verify <version>
```

## Troubleshooting

### Shell Integration Not Working

Make sure you've:

1. Added the init command to your shell profile
2. Restarted your shell or sourced the profile file
3. The `bunenv` command is available in your PATH

### Version Not Switching Automatically

Check that:

1. Shell integration is set up correctly
2. A `.bun-version` file exists in the current or parent directories
3. The specified version is installed

### Installation Errors

For installation problems:

1. Check your internet connection
2. Ensure you have write permissions to the installation directory
3. Try with `--verbose` flag for more information:
   ```bash
   bunenv install --verbose <version>
   ```
