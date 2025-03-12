# TICKET-003: Implement core module

## Description

Create the core module that provides foundational functionality for the bunenv tool. This includes configuration, path management, and environment detection.

## Tasks

- [x] Create the core module directory structure
- [x] Implement the `config.ts` module for standardizing configuration
- [x] Implement the `paths.ts` module for centralizing and standardizing path references
- [x] Implement the `environment.ts` module for OS and shell detection
- [x] Create unit tests for all core module functionality
- [ ] Update any existing code to use the new core modules

## Acceptance Criteria

- [x] The `src/core` directory exists with appropriate modules
- [x] Configuration constants are centralized in `config.ts` instead of scattered across modules
- [x] Path handling is standardized in `paths.ts` with consistent naming
- [x] Environment detection provides accurate information about the OS and shell
- [x] All core module functions are covered by unit tests
- [ ] The modules are imported and used in at least one other part of the codebase

## Notes

- All path handling should be abstracted in the paths module to make it easier to support different platforms
- Configuration values should have sensible defaults that can be overridden by environment variables
- The environment module should detect shell type to enable proper shim generation
