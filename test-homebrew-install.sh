#!/bin/bash

# Test script for bunenv Homebrew installation

set -e

echo "Testing bunenv Homebrew installation..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "Error: Homebrew is not installed."
    exit 1
fi

# Check if bunenv is installed, uninstall if it is
if brew list bunenv &> /dev/null; then
    echo "Uninstalling existing bunenv installation..."
    brew uninstall --force bunenv
fi

# Install bunenv from the local formula
echo "Installing bunenv from local formula..."
BREW_TAP_PATH=$(brew --prefix)/Homebrew/Library/Taps
LOCAL_FORMULA_PATH="$(pwd)/homebrew/bunenv.rb"

if [ ! -f "$LOCAL_FORMULA_PATH" ]; then
    echo "Error: Local formula not found at $LOCAL_FORMULA_PATH"
    exit 1
fi

echo "Using formula at: $LOCAL_FORMULA_PATH"
brew install --formula "$LOCAL_FORMULA_PATH"

# Verify the installation
echo "Verifying bunenv installation..."
which bunenv
ls -la $(which bunenv)
bunenv --version

echo "Testing commands..."
bunenv list
bunenv global
echo "Installation test completed successfully!" 