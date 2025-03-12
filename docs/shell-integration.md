# Shell Integration Guide

This guide explains how to set up bunenv's shell integration, which enables automatic version switching based on your project's `.bun-version` file.

## How Shell Integration Works

When properly configured, bunenv shell integration:

1. Intercepts calls to `bun` and its subcommands
2. Automatically determines which Bun version to use based on:
   - The `.bun-version` file in the current directory
   - The `.bun-version` file in parent directories (if not found in current)
   - The global version configured with `bunenv global`
3. Executes the correct version of Bun automatically

## Setting Up Shell Integration

### Bash

Add the following line to your `~/.bashrc` or `~/.bash_profile`:

```bash
eval "$(bunenv init -)"
```

Restart your shell or run:

```bash
source ~/.bashrc  # or ~/.bash_profile
```

### Zsh

Add the following line to your `~/.zshrc`:

```zsh
eval "$(bunenv init -)"
```

Restart your shell or run:

```zsh
source ~/.zshrc
```

### Fish

Add the following line to your `~/.config/fish/config.fish`:

```fish
bunenv init - | source
```

Restart your shell or run:

```fish
source ~/.config/fish/config.fish
```

## What Gets Added to Your Shell

The initialization script adds:

1. A function that intercepts the `bun` command
2. Path modifications to ensure bunenv's shims directory is in your PATH
3. Shell completions for bunenv commands

## Manual Configuration

If you prefer to set up shell integration manually:

1. Add bunenv's shims directory to your PATH:

   ```bash
   export PATH="$HOME/.bunenv/shims:$PATH"
   ```

2. Set up shell command rehashing for new shims:
   ```bash
   bunenv rehash
   ```

## Verifying Setup

To verify that shell integration is working correctly:

1. Create a test directory:

   ```bash
   mkdir bunenv-test
   cd bunenv-test
   ```

2. Create a `.bun-version` file:

   ```bash
   echo "1.0.0" > .bun-version
   ```

   (Make sure you have version 1.0.0 installed with `bunenv install 1.0.0`)

3. Run the `bun --version` command:

   ```bash
   bun --version
   ```

   If shell integration is working, this should show version 1.0.0 regardless of your global version.

## Disabling Shell Integration

If you need to temporarily disable shell integration:

```bash
BUNENV_DISABLE=1 bun <command>
```

This will use the system's default Bun installation.

## Troubleshooting

### Command Not Found

If you get "command not found" errors:

- Ensure bunenv is properly installed
- Check if `~/.bunenv/shims` is in your PATH
- Run `bunenv rehash` to refresh shims

### Wrong Version Being Used

If bunenv is using the wrong version:

- Check that your `.bun-version` file exists and contains the correct version
- Run `bunenv version` to see which version bunenv thinks should be active
- Verify the version is installed with `bunenv list`

### Shell Function Not Loading

If the shell function isn't loading:

- Make sure the eval line is in your shell profile
- Check for syntax errors in your shell configuration files
- Ensure bunenv is in your PATH before loading shell integration

## Advanced: Understanding Shims

Bunenv uses "shims" to intercept commands. These are lightweight executables that:

1. Determine the Bun version to use
2. Execute the correct version

The shims are located in `~/.bunenv/shims/` and are created when you run `bunenv rehash` or install a new version.

## Shell Integration Options

When running `bunenv init`, you can pass options:

- `-` : Print the shell commands instead of executing them
- `--no-rehash` : Skip automatic rehashing
- `--no-shell` : Skip shell integration (only set paths)

For example:

```bash
eval "$(bunenv init - --no-rehash)"
```
