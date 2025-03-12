# Global Bun Version Management

This guide shows how to set up and manage global Bun versions using bunenv.

## Why Use Global Versions?

Setting a global Bun version provides a default version that's used when no specific project version is defined. This is useful for:

1. **General development** - Having a stable version for day-to-day tasks
2. **Quick prototyping** - Starting new projects without configuring versions
3. **System-wide tools** - Running global Bun packages consistently
4. **Convenience** - Having a fallback version always available

## Setting Up Global Versions with bunenv

### Installing and Setting a Global Version

```bash
# Install a specific Bun version
bunenv install 1.0.22

# Set it as the global default version
bunenv global 1.0.22
```

### Verifying Your Global Version

Check that the global version is set correctly:

```bash
bunenv global
# Output: 1.0.22

# Or use the version command
bunenv version
# Output: 1.0.22 (set by /home/user/.bunenv/version)
```

You can also verify the actual Bun version:

```bash
bun --version
# Output: 1.0.22
```

## Managing Multiple Global Versions

### Listing Installed Versions

Check which Bun versions you have installed:

```bash
bunenv list
# Output:
#  * 1.0.22 (set by /home/user/.bunenv/version)
#    1.0.10
#    1.0.5
```

The version with the `*` indicates the currently active version.

### Switching Between Global Versions

You can easily switch between installed Bun versions:

```bash
# Switch to a different version
bunenv global 1.0.10

# Verify the change
bunenv global
# Output: 1.0.10
```

### Installing New Versions

Install additional Bun versions as needed:

```bash
# Install a specific version
bunenv install 1.0.23

# Or install the latest version
bunenv install latest

# Set as global
bunenv global 1.0.23
```

### Uninstalling Versions

Remove versions you no longer need:

```bash
bunenv uninstall 1.0.5
```

## Using Global Versions with Project Overrides

The global version serves as a fallback when no project-specific version is defined. Here's how the version resolution works:

```bash
# In a directory with no .bun-version file
cd ~/random-directory
bunenv version
# Output: 1.0.22 (set by /home/user/.bunenv/version)

# In a project with a specific version
cd ~/my-project-with-specific-version
bunenv version
# Output: 1.0.10 (set by /home/user/my-project-with-specific-version/.bun-version)
```

## Example: Working with Global Packages

Global Bun versions are particularly useful for managing global packages:

```bash
# Set a global version
bunenv global 1.0.22

# Install a global package
bun install -g typescript

# Use the globally installed package
tsc --version
# Output: Version 5.0.2
```

If you switch the global Bun version, you may need to reinstall global packages for that version:

```bash
# Switch to a different version
bunenv global 1.0.10

# Re-install global package for this version
bun install -g typescript
```

## Best Practices

1. **Choose a stable version** for your global default
2. **Update global versions periodically** but not too frequently
3. **Use project-specific versions** for production work
4. **Keep global packages minimal** to avoid conflicts
5. **Consider compatibility** with commonly used tools when choosing a global version

## Advanced: Multiple Global Versions for Different Shells

You can use the `shell` command to temporarily use a different Bun version in a specific shell session:

```bash
# Start a new shell with a specific version
bunenv shell 1.0.10

# This version is only active in this shell session
bunenv version
# Output: 1.0.10 (set by BUNENV_VERSION environment variable)

# In other terminals, the global version remains unchanged
```

This is useful for testing or when you need to temporarily use a different version without affecting your global settings.

## Troubleshooting

### Common Issues

1. **Global version not being used**

   - Make sure no `.bun-version` file exists in your current directory or parent directories
   - Check that the `BUNENV_VERSION` environment variable is not set

2. **"Command not found" after switching versions**

   - Run `bunenv rehash` to update shims after installing a new version

3. **Permissions issues**
   - Ensure you have the necessary permissions to write to the bunenv directories
   - Try running with sudo for system-wide installations
