# TICKET-006: Implement version installation system

## Description

Implement a robust version installation system that handles downloading, unpacking, and installing different Bun versions. This system should support version upgrades, downgrades, and handle network issues gracefully.

## Tasks

- [x] Create the version manager module in `src/versions/version-manager.ts`
- [x] Implement version installation functionality with proper error handling
- [x] Implement listing of installed versions
- [x] Implement version validation and checking
- [x] Implement cleanup for failed installations
- [x] Create unit tests for the version manager
- [x] Create component tests for the installation system
- [ ] Update the CLI commands to use the new version manager

## Acceptance Criteria

- [x] Versions can be installed by specifying exact versions (e.g., "1.0.0")
- [x] The system gracefully handles network errors during downloads
- [x] Version listing correctly shows all installed versions
- [x] Installation process creates the correct directory structure
- [x] Failed installations are cleaned up properly
- [x] Downloaded archives are properly extracted and binaries are made executable
- [x] All functions are properly tested with unit tests
- [x] The installation process provides appropriate feedback

## Notes

- The installation system should use the core modules for path handling
- Consider adding a download progress indicator for better user experience
- Make sure to handle platform-specific differences (Windows vs Unix)
- The system should validate checksums if available
- Consider caching downloaded files to avoid re-downloading
