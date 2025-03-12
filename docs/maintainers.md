# Maintainer's Guide

This document provides guidance for maintaining and releasing bunenv.

## Development Workflow

### Code Structure

- `src/` - Source code
- `test/` - Test files
- `bin/` - Executable scripts
- `docs/` - Documentation
- `scripts/` - Build and utility scripts

### Testing

Always run tests before merging changes:

```bash
# Run all tests
bun test

# Run specific test suites
bun test:unit
bun test:component
bun test:integration
```

### Building

The project uses a custom build script that supports development and production builds:

```bash
# Development build (with source maps)
bun run build

# Production build (minified, no source maps)
bun run build:prod
```

## Release Process

### 1. Update Version and Changelog

1. Decide on the new version number (following [Semantic Versioning](https://semver.org/))
2. Update the version in `package.json`
3. Update `CHANGELOG.md` to move changes from "Unreleased" to the new version section

### 2. Test the Package

Run a dry release to ensure the package builds correctly:

```bash
bun run release:dry
```

This will create a tarball (e.g., `bunenv-0.2.0.tgz`) that you can inspect to ensure it contains the correct files.

### 3. Generate Release Notes

Generate release notes from the CHANGELOG:

```bash
bun run release:notes
```

This script will:

- Extract release notes from the CHANGELOG.md for the current version
- Create a temporary file with the release notes
- Optionally create and push a Git tag

### 4. Create a GitHub Release

1. Go to the [GitHub Releases page](https://github.com/jonathanphilippou/bunenv/releases)
2. Click "Draft a new release"
3. Select the tag or create a new one (e.g., `v0.2.0`)
4. Paste the release notes from the previous step
5. Publish the release

### 5. Publish to npm

Ensure you're logged in to npm:

```bash
npm login
```

Then publish:

```bash
bun run release
```

This script will:

- Build the package in production mode
- Publish to npm

## Maintenance Tasks

### Updating Dependencies

Periodically check for outdated dependencies:

```bash
npm outdated
```

Update them as needed, ensuring tests pass after updates.

### Reviewing Issues and Pull Requests

- Regularly check for new issues and pull requests
- Label issues appropriately
- Provide feedback on pull requests
- Ensure tests pass before merging

### Documentation Updates

Keep documentation up-to-date as features change:

- README.md - Main documentation
- docs/ - Additional documentation
- Shell integration guide
- Usage examples

## CI/CD

The project uses GitHub Actions for continuous integration:

- `ci.yml` - Runs on push to main and pull requests

  - Runs tests
  - Builds the package
  - Runs linting

- `release.yml` - Runs when a new release is created
  - Runs tests
  - Builds the package
  - Publishes to npm
