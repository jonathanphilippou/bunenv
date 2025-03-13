# Homebrew Integration for bunenv

This directory contains the Homebrew formula for installing bunenv using Homebrew on macOS and Linux.

## Options for distributing via Homebrew

### Option 1: Personal Tap (Quick and easy)

1. Create a GitHub repository named `homebrew-tap`
2. Add the `bunenv.rb` formula file to the repository
3. Users can then install bunenv with:

```bash
brew tap jonathanphilippou/tap
brew install bunenv
```

### Option 2: Submit to Homebrew Core (For wider distribution)

For more widespread distribution, submitting to Homebrew Core is recommended:

1. Fork the [Homebrew Core repository](https://github.com/Homebrew/homebrew-core)
2. Add the formula to the appropriate location (Formula/b/bunenv.rb)
3. Submit a pull request

## Testing the formula locally

```bash
# Create a local formula
brew create https://registry.npmjs.org/bunenv/-/bunenv-0.2.2.tgz --set-name bunenv

# Replace the auto-generated formula with our optimized one
# Copy contents of bunenv.rb to the location shown in the brew create output

# Test installation from the local formula
brew install --build-from-source <path-to-formula>

# Audit the formula for issues
brew audit --strict --online <path-to-formula>
```

## Formula maintenance

When releasing new versions of bunenv:

1. Update the version number in the formula
2. Update the SHA256 hash (get it with: `curl -sL https://registry.npmjs.org/bunenv/-/bunenv-x.y.z.tgz | shasum -a 256`)
3. Test the formula with the new version
4. Submit the update to your tap or as a PR to Homebrew Core
