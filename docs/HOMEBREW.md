# Homebrew Integration for bunenv

This document outlines the current status and future plans for the Homebrew integration of bunenv.

## Current Status

As of bunenv v0.2.4, we have:

- Created a Homebrew formula in our own tap repository
- Successfully tested the installation via Homebrew
- Updated the README with installation instructions
- Set up automation for updating the formula when new versions are released
- Created a robust update script for Homebrew formula maintenance

The current Homebrew implementation is a placeholder that prints the version number and a message. This is intentional as we work towards a more production-ready implementation.

## Installation

Users can install bunenv using Homebrew with:

```bash
brew install jonathanphilippou/tap/bunenv
```

## Development Status

The Homebrew formula is located in:

- GitHub repository: https://github.com/jonathanphilippou/homebrew-tap
- Formula file: Formula/bunenv.rb

## Updating the Homebrew Formula

When a new version of bunenv is released, the Homebrew formula needs to be updated. We have automated this process with a script:

```bash
# Run from the bunenv repository root
bun homebrew:update
```

This script:

1. Gets the current version from package.json
2. Calculates the SHA256 hash of the GitHub tarball
3. Updates the local formula in the repository
4. Clones the tap repository
5. Updates the formula in the tap repository
6. Commits and pushes the changes
7. Cleans up temporary files

## Known Issues

1. The current implementation is a placeholder and doesn't provide the full functionality of bunenv.
2. We need to finalize the full implementation and update the formula accordingly.

## Next Steps

1. **Complete Full Implementation**

   - Update the bin/bunenv script to properly handle Homebrew installations
   - Ensure compatibility across installation methods (npm, Homebrew, direct)

2. **Enhance Homebrew Formula**

   - Update the formula to use the complete implementation
   - Improve error handling and installation robustness

3. **Submit to Homebrew Core**

   - Once the implementation is stable and well-tested, prepare for submission to Homebrew Core
   - Document the submission process and requirements

4. **Automation**
   - Add CI/CD workflows for automatic formula updates
   - Integrate Homebrew updates into the release workflow

## Roadmap to Homebrew Core Submission

To be accepted into Homebrew Core, we need to:

1. Ensure bunenv has a stable, well-documented API
2. Have sufficient test coverage for all core functionality
3. Demonstrate significant user adoption (GitHub stars, downloads, etc.)
4. Eliminate all placeholder implementations
5. Ensure installation works flawlessly on all supported platforms

## Resources

- [Homebrew Documentation](https://docs.brew.sh/)
- [Homebrew Formula Cookbook](https://docs.brew.sh/Formula-Cookbook)
- [Homebrew Core submission guidelines](https://docs.brew.sh/Adding-Software-to-Homebrew)
