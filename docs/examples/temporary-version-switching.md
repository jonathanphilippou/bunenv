# Temporary Version Switching with bunenv

This guide covers how to temporarily switch Bun versions for testing, experimentation, or specific tasks without affecting your global or project-specific settings.

## Why Use Temporary Version Switching?

Temporary version switching is useful for:

1. **Testing compatibility** - Check if your code works with different Bun versions
2. **Debugging version-specific issues** - Isolate problems that only occur in certain versions
3. **Running one-off commands** - Execute scripts that require a specific Bun version
4. **Experiment with new versions** - Try new features without committing to a version change

## Methods for Temporary Version Switching

bunenv offers two primary methods for temporary version switching:

1. **`bunenv shell`** - Spawns a new shell with a specific Bun version
2. **Environment variables** - Using `BUNENV_VERSION` to override the current version

## Using `bunenv shell` Command

The `bunenv shell` command spawns a new shell session with the specified Bun version:

```bash
# Start a new shell with Bun 1.0.10
bunenv shell 1.0.10

# Verify the version
bunenv version
# Output: 1.0.10 (set by BUNENV_VERSION environment variable)

# Run commands with this version
bun --version
# Output: 1.0.10

# Exit the shell to return to your previous version
exit
```

### Verifying Version Isolation

The version change is only active in the spawned shell and doesn't affect other terminal sessions:

```bash
# Terminal 1: Set a shell-specific version
bunenv shell 1.0.10
bunenv version
# Output: 1.0.10 (set by BUNENV_VERSION environment variable)

# Terminal 2: Still using global or project version
bunenv version
# Output: 1.0.22 (set by /home/user/.bunenv/version)
```

## Using the `BUNENV_VERSION` Environment Variable

For more fine-grained control, you can directly set the `BUNENV_VERSION` environment variable:

```bash
# Set the environment variable for the current shell
export BUNENV_VERSION=1.0.10

# Verify the version
bunenv version
# Output: 1.0.10 (set by BUNENV_VERSION environment variable)

# Run commands with this version
bun --version
# Output: 1.0.10

# Clear the environment variable to return to your previous version
unset BUNENV_VERSION
```

### Running Single Commands with a Specific Version

You can prefix individual commands with the environment variable:

```bash
# Run a single command with a specific version
BUNENV_VERSION=1.0.10 bun run my-script.js

# The next command will use your default version
bun --version
# Output: 1.0.22
```

## Example: Testing Compatibility Across Versions

Here's a practical example of testing your application with multiple Bun versions:

```bash
#!/bin/bash
# save as test-versions.sh

# Define the versions to test
VERSIONS=("1.0.10" "1.0.15" "1.0.22")

# Install the versions if needed
for VERSION in "${VERSIONS[@]}"; do
  bunenv install "$VERSION" || echo "Failed to install $VERSION"
done

# Run tests with each version
for VERSION in "${VERSIONS[@]}"; do
  echo "Testing with Bun $VERSION"
  export BUNENV_VERSION="$VERSION"
  bun --version
  bun test
done

# Reset to the default version
unset BUNENV_VERSION
```

Make the script executable and run it:

```bash
chmod +x test-versions.sh
./test-versions.sh
```

## Example: Exploring a New Version

Try out a new Bun version without committing to it:

```bash
# Install the latest version
bunenv install latest

# Start a shell with the latest version
bunenv shell latest

# Try out new features
bun --version
bun run some-script.ts

# Exit when done
exit
```

## Best Practices

1. **Use `bunenv shell` for interactive work** - It's cleaner and automatically resets when you exit
2. **Use environment variables for scripts** - Better for automation and one-off commands
3. **Always verify the active version** before running important commands
4. **Reset to your regular version** when done with temporary testing
5. **Document version dependencies** in your project README

## Advanced: Subshell with Version Override

You can create a subshell with a specific version for a group of commands:

```bash
# Start a subshell with a specific version
(
  export BUNENV_VERSION=1.0.10
  echo "Running with Bun $(bun --version)"
  bun run build
  bun run test
)

# Back to the original version
echo "Back to Bun $(bun --version)"
```

## Troubleshooting

### Common Issues

1. **Version not changing**

   - Verify the version is installed: `bunenv list`
   - Check for conflicting `.bun-version` files
   - Ensure `bunenv` is properly set up in your shell

2. **"Version not installed" error**

   - Install the required version first: `bunenv install <version>`

3. **Changes affecting other shells**

   - Make sure you're using `bunenv shell` or a subshell, not modifying your shell startup files

4. **Command not found after switching**
   - Run `bunenv rehash` to rebuild shims after installing new versions
