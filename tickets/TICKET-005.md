# TICKET-005: Implement shim generation system

## Description

Implement the shim generation system that creates shell script wrappers for Bun executables. Shims intercept calls to Bun commands and redirect them to the appropriate Bun version based on the current environment.

## Tasks

- [x] Create the shim manager module in `src/shims/shim-manager.ts`
- [x] Implement templates for different shell types (bash, fish, Windows cmd)
- [x] Implement the shim creation function
- [x] Implement detection and resolution of executable files
- [x] Implement the rehashing mechanism to regenerate shims
- [x] Implement shell environment setup for temporary version switching
- [x] Create unit tests for the shim manager
- [ ] Create component tests for the complete shim system
- [ ] Update the CLI commands to use the new shim manager

## Acceptance Criteria

- [x] Shims are created for all executable files in all installed Bun versions
- [x] Shims correctly determine which Bun version to use based on environment variables, .bun-version files, and package.json
- [x] Shims have proper cross-platform support (bash/zsh, fish, Windows cmd)
- [x] The rehash command works correctly to regenerate all shims
- [x] Shims handle edge cases like missing versions with informative messages
- [x] All functions are properly tested with unit tests
- [ ] The shell command correctly sets up the environment for using a specific Bun version

## Notes

- Shims should handle circular dependencies appropriately to avoid infinite loops
- System Bun fallback should be implemented for when no version is specified or the specified version is not installed
- Windows support requires special handling for file extensions and path separators
- Fish shell has a different syntax that needs to be accommodated
- Consider performance implications of how shims resolve the Bun version
