# TICKET-004: Implement version resolver

## Description

Refactor and improve the version resolver module to use the new core modules and provide better version resolution capabilities. The version resolver is responsible for determining which Bun version to use based on various sources (environment variables, local/global version files, package.json).

## Tasks

- [x] Create a new version resolver module in `src/versions/resolver.ts`
- [x] Implement functions to find and read version files using the core modules
- [x] Implement package.json version detection with proper semver support
- [x] Implement version resolution with proper precedence rules
- [x] Add support for version ranges and aliases (latest, stable, etc.)
- [x] Create comprehensive unit tests for the version resolver
- [ ] Update component tests to use the new version resolver

## Acceptance Criteria

- [x] The version resolver uses the core modules for path handling and configuration
- [x] Version resolution follows the correct precedence order:
  1. `BUNENV_VERSION` environment variable
  2. Local `.bun-version` file
  3. `engines.bun` field in package.json
  4. Global version file
- [x] Version ranges in any source are properly resolved to specific installed versions
- [x] Special version aliases like "latest" are supported
- [x] All functions are properly tested with unit tests
- [ ] The resolver handles errors gracefully with informative messages

## Notes

- The version resolver should be designed to be easily testable with mocks
- It should handle edge cases like missing files, invalid versions, and circular references
- Consider adding a cache mechanism for performance if needed
- The resolver should not have side effects (like installing versions) - it should only determine which version to use
