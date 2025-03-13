# Changelog

All notable changes to bunenv will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.6] - 2024-03-13

### Fixed

- Fixed version file formatting in global version file
- Improved version switching reliability
- Ensured proper shim behavior with global version changes

## [0.2.5] - 2024-03-13

### Added

- Improved Homebrew formula with intelligent command handling
- Added post-installation message with shell integration instructions
- Enhanced user experience for different commands

### Changed

- Different output based on command: full help for `--help` and no args, version for `-v`, simpler message for others

## [0.2.4] - 2024-03-13

### Added

- Homebrew tap for simplified installation on macOS and Linux
- Improved bin/bunenv script to better handle different installation paths
- Documentation for Homebrew integration (docs/HOMEBREW.md)

### Fixed

- Fixed compatibility issues with Homebrew installation
- Enhanced error handling in path resolution for better diagnostics

## [0.2.3] - 2024-03-13

### Added

- Homebrew formula for easier installation on macOS and Linux
- Script to automate Homebrew formula updates
- Homebrew installation fix script

### Fixed

- Fixed executable path in Homebrew installation
- Improved bin/bunenv script to support multiple installation paths
- Enhanced Homebrew formula to ensure correct symlink creation

## [0.2.2] - 2024-03-12

### Changed

- Changed version flag from `-V, --version` to `-v, --version` for better usability

## [0.2.1] - 2024-03-12

### Fixed

- Fixed installation process to correctly handle Bun archive structure
- Updated build script to remove problematic sourcemap configuration

## [0.2.0] - 2024-03-12

### Added

- Comprehensive documentation including shell integration guide and usage examples
- Testing utilities for mocking filesystem operations
- Direct function tests for core functionality
- Build script with production/development configurations
- Installer script for easy installation
- GitHub Actions workflows for CI/CD
- CHANGELOG.md for tracking changes

### Changed

- Improved package.json with better metadata and dependency management
- Enhanced build process with TypeScript type checking
- Standardized version numbers in dependencies

### Fixed

- Properly marked skipped tests with documentation
- Fixed integration test structure

## [0.1.1] - 2024-03-10

### Added

- Basic CLI command structure
- Core modules for version management
- Version resolver for finding the correct Bun version
- Shim generator for running commands
- Initial test setup

### Changed

- Refactored CLI commands to use Commander
- Improved error handling and output formatting

## [0.1.0] - 2024-03-01

### Added

- Initial project setup
- Basic functionality for managing Bun versions
- Simple shell integration
