# bunenv

A version manager for Bun JavaScript runtime, inspired by tools like rbenv and nvm.

## Features

- 🚀 Install and manage multiple Bun versions
- 🔄 Switch between versions globally or per project
- 🔍 Automatic version detection using `.bun-version` files
- 🛠️ Shell integration for seamless version switching
- 🐚 Support for bash, zsh, and fish shells
- 🍺 Homebrew installation support

## Development Status

The project is now ready for initial release with all core functionality in place:

- ✅ Core modules: Version resolver, Path utilities, and Configuration
- ✅ Version manager: Installation, listing, and management of Bun versions
- ✅ Shim generator: Creation and management of shims for version switching
- ✅ CLI Commands: All commands are implemented and working
- ✅ Testing: Unit tests passing, direct function tests implemented, integration tests in progress
- ✅ Documentation: Comprehensive documentation with guides and examples
- ✅ Distribution: npm packaging and CI/CD workflows configured

### Current focus

- Ongoing testing improvements
- Community feedback and bug fixes
- Additional features based on user needs

## Documentation

- [Shell Integration Guide](./docs/shell-integration.md) - Detailed guide on setting up and troubleshooting shell integration

### Examples

- [Project-Specific Version Management](./docs/examples/project-specific-version.md) - How to manage Bun versions per project
- [Global Version Management](./docs/examples/global-version-management.md) - Setting up and working with global Bun versions
- [Temporary Version Switching](./docs/examples/temporary-version-switching.md) - Temporarily using different Bun versions

## Installation

### Prerequisites

- Node.js 16+ or Bun
- UNIX-like operating system (macOS, Linux) or Windows with WSL

### Using Homebrew (macOS and Linux)

The easiest way to install bunenv on macOS or Linux is via Homebrew:

```bash
# Install bunenv via Homebrew
brew install jonathanphilippou/tap/bunenv

# Verify the installation
bunenv --version
```

### Quick Install (Recommended)

Alternatively, you can install bunenv using our installer script:

```bash
# Using curl
curl -o- https://raw.githubusercontent.com/jonathanphilippou/bunenv/main/install.sh | bash

# Or using wget
wget -qO- https://raw.githubusercontent.com/jonathanphilippou/bunenv/main/install.sh | bash
```

This script will install bunenv and set up shell integration automatically.

### Install via npm

```bash
npm install -g bunenv

# Then set up shell integration
bunenv init >> ~/.bashrc  # or your appropriate shell config file
source ~/.bashrc
```

### Install via Bun

```bash
bun install -g bunenv

# Then set up shell integration
bunenv init >> ~/.bashrc  # or your appropriate shell config file
source ~/.bashrc
```

### Manual installation

1. Clone the repository:

```bash
git clone https://github.com/jonathanphilippou/bunenv.git
cd bunenv
```

2. Install dependencies:

```bash
npm install
# or if you have Bun installed
bun install
```

3. Build the project:

```bash
npm run build
# or
bun run build
```

4. Link the binary:

```bash
npm link
# or
bun link
```

5. Set up shell integration:

```bash
bunenv init >> ~/.bashrc
# Or for zsh
bunenv init --shell zsh >> ~/.zshrc
# Or for fish
bunenv init --shell fish >> ~/.config/fish/conf.d/bunenv.fish
```

6. Restart your shell or source the configuration file:

```bash
source ~/.bashrc
# Or for zsh
source ~/.zshrc
```

## Quick Start

### Installing Bun versions

```bash
# Install a specific version
bunenv install 1.0.0

# List installed versions
bunenv list
```

### Setting global version

```bash
# Set the global Bun version
bunenv global 1.0.0

# View current global version
bunenv global
```

### Setting local version

```bash
# Set the local Bun version for the current directory
bunenv local 1.0.0

# View current local version
bunenv local
```

### Temporary version switching

```bash
# Spawn a new shell with a specific Bun version
bunenv shell 1.0.0
```

## Command Reference

### `bunenv install <version>`

Install a specific version of Bun.

Options:

- `-f, --force`: Force reinstall if the version is already installed

### `bunenv list`

List all installed Bun versions.

Aliases: `ls`

Options:

- `-a, --all`: Show all versions, including system installations

### `bunenv global [version]`

Set or show the global Bun version.

### `bunenv local [version]`

Set or show the local Bun version for the current directory.

### `bunenv shell <version>`

Spawn a new shell using the specified Bun version.

### `bunenv version`

Show the current active Bun version.

Options:

- `-v, --verbose`: Show detailed version information

### `bunenv rehash`

Rebuild Bun shim executables.

### `bunenv init`

Configure shell integration for bunenv.

Options:

- `-s, --shell <type>`: Specify shell type (bash, zsh, fish)

## How it Works

bunenv works by creating a directory of shims, which map to the commands for the selected Bun version. When you run a shim, bunenv determines which Bun version to use by checking:

1. The `BUNENV_VERSION` environment variable
2. A `.bun-version` file in the current or parent directories
3. The global Bun version set with `bunenv global`

## Version Resolution

The version resolution follows this priority order:

1. The `BUNENV_VERSION` environment variable
2. The `.bun-version` file in the current directory
3. The `.bun-version` file in parent directories (searching up to root)
4. The global version set with `bunenv global`

## Directory Structure

```
$HOME/.bunenv/
├── versions/         # Bun versions
│   ├── 1.0.0/
│   │   └── bin/
│   │       └── bun
│   └── 1.0.1/
│       └── bin/
│           └── bun
├── shims/            # Command shims
├── version           # Global version file
└── .bun-version      # Local version file (in project directories)
```

## Development

### Setup

```bash
git clone https://github.com/yourusername/bunenv.git
cd bunenv
bun install
```

### Testing

```bash
bun test          # Run all tests
bun test:unit     # Run unit tests
bun test:component # Run component tests
bun test:integration # Run integration tests
```

### Building

```bash
bun run build
```

### Project Structure

The project is structured into several key modules:

- `src/core/` - Core utilities (paths, config, environment)
- `src/resolvers/` - Version resolution logic
- `src/versions/` - Version management and installation
- `src/shims/` - Shim generation and management
- `src/cli/` - CLI commands and utilities
- `src/utils/` - Shared utility functions

### Testing Strategy

We follow a test pyramid approach:

- **Unit Tests**: Test individual functions in isolation
- **Component Tests**: Test interactions between modules
- **Integration Tests**: Test end-to-end functionality

## Contributing

We welcome contributions of all kinds! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/bunenv.git`
3. Install dependencies: `bun install`
4. Create a branch for your contribution: `git checkout -b my-feature-branch`

### Development Workflow

1. Make your changes
2. Run tests: `bun test`
3. Format your code: `bun run format`
4. Commit your changes following [conventional commits](https://www.conventionalcommits.org/)
5. Push to your fork and submit a pull request

### Homebrew Formula Development

If you're working on improving the Homebrew integration:

1. Read the [Homebrew documentation](docs/HOMEBREW.md) to understand the current implementation
2. Test any changes locally with `brew install --build-from-source ./homebrew/bunenv.rb`
3. Update the formula using the automated script: `bun homebrew:update`

### Code Standards

- Follow TypeScript best practices
- Write tests for new functionality
- Document your code with JSDoc comments
- Keep commits focused and descriptive

### Documentation

When adding or changing features, please update the relevant documentation:

- README.md for general usage information
- Specific documentation files in the `docs/` directory

For detailed information on specific topics, check out these resources:

- [Contribution Guidelines](./docs/CONTRIBUTING.md)
- [Code of Conduct](./docs/CODE_OF_CONDUCT.md)
- [Homebrew Integration](./docs/HOMEBREW.md)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by rbenv and nvm
- Built with TypeScript and Bun
- Thanks to all contributors

# Using npm

npm install -g bunenv

# Using bun

bun install -g bunenv

Diagram:

```
+---------------------------------------------+
|                   User                      |
+----------------------+----------------------+
                       |
                       | (runs command: e.g., bun --version)
                       v
+---------------------------------------------+
|                 PATH lookup                 |
|   (~/.bunenv/shims takes precedence)        |
+----------------------+----------------------+
                       |
                       | (finds shim first)
                       v
+---------------------------------------------+
|               ~/.bunenv/shims/bun           |  <---- Shim Script (Bash)
|                                             |       Intercepts all 'bun' calls
+----------------------+----------------------+
                       |
                       | (looks for version)
                       v
+---------------------/ \---------------------+
|  Version Resolution Process                 |
|                                             |
|  1. Check BUNENV_VERSION env var            |
|  2. Look for .bun-version file (local)      |
|  3. Check package.json engines.bun          |
|  4. Check ~/.bunenv/version (global)        |
|                                             |
+----------------------+----------------------+
                       |
                       | (selects version)
                       v
+---------------------------------------------+
|      ~/.bunenv/versions/{version}/bin/bun   |  <---- Actual bun binary
+---------------------------------------------+
          |                        |
          v                        v
+-------------------+   +----------------------+
| bunenv CLI Tool   |   | User's Bun Commands  |
| (bunenv install)  |   | (managed by version) |
+-------------------+   +----------------------+

+---------------------------------------------+
|            Core Components                  |
+---------------------------------------------+
|                                             |
|  ~/.bunenv/                                 |
|  ├── shims/                                 |
|  │   └── bun           (shim executable)    |
|  ├── versions/                              |
|  │   ├── 1.0.0/        (installed version)  |
|  │   │   └── bin/                           |
|  │   │       └── bun   (actual executable)  |
|  │   └── 1.0.22/       (another version)    |
|  │       └── bin/                           |
|  │           └── bun                        |
|  └── version           (global version file)|
|                                             |
+---------------------------------------------+

+--------------+       +--------------------+
| bunenv CLI   | <---> | Version Management |
|              |       | (install/list/etc) |
+--------------+       +--------------------+
       |
       v
+-------------------------------+
| Commands:                     |
| - bunenv install <version>    |
| - bunenv global <version>     |
| - bunenv local <version>      |
| - bunenv rehash               |
| - bunenv list                 |
| - bunenv version              |
| - bunenv shell <version>      |
| - bunenv init                 |
+-------------------------------+


```
