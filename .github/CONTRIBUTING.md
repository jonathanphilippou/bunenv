# Contributing to bunenv

Thank you for your interest in contributing to bunenv! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with the following information:

- A clear, descriptive title
- A detailed description of the issue
- Steps to reproduce the bug
- Expected behavior
- Actual behavior
- Environment information (OS, Node.js/Bun version, etc.)
- Screenshots if applicable

### Suggesting Features

We welcome feature suggestions! When suggesting a feature, please:

- Provide a clear, descriptive title
- Describe the feature in detail
- Explain why this feature would be useful
- Provide examples of how it would be used

### Pull Requests

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests: `bun test`
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature-name`
7. Open a pull request

#### Pull Request Guidelines

- Follow the existing code style and conventions
- Add or update tests as necessary
- Update documentation as necessary
- Keep your PR focused on a single issue/feature
- Link related issues in the PR description

## Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/bunenv.git
   cd bunenv
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Run tests:
   ```bash
   bun test
   ```

## Project Structure

- `src/` - Source code
  - `core/` - Core utilities (paths, config, environment)
  - `resolvers/` - Version resolution logic
  - `versions/` - Version management and installation
  - `shims/` - Shim generation and management
  - `cli/` - CLI commands and utilities
  - `utils/` - Shared utility functions
- `test/` - Tests
  - `unit/` - Unit tests
  - `component/` - Component tests
  - `integration/` - Integration tests
- `bin/` - Executable scripts

## Testing

We use Bun's built-in test runner for testing. Tests are organized into:

- **Unit tests**: Test individual functions in isolation
- **Component tests**: Test interactions between modules
- **Integration tests**: Test end-to-end functionality

Run all tests:

```bash
bun test
```

Run specific test suites:

```bash
bun test:unit
bun test:component
bun test:integration
```

## Documentation

- Use JSDoc comments for all public APIs
- Update the README.md when adding new features
- Keep code examples in documentation up-to-date

## License

By contributing to bunenv, you agree that your contributions will be licensed under the project's MIT License.
