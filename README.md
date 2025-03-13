# bunenv

A version manager for Bun JavaScript runtime, inspired by tools like rbenv and nvm.

## Features

- 🚀 Install and manage multiple Bun versions
- 🔄 Switch between versions globally or per project
- 🔍 Automatic version detection using `.bun-version` files
- 🛠️ Shell integration for seamless version switching
- 🐚 Support for bash, zsh, and fish shells

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

### Quick Install (Recommended)

The easiest way to install bunenv is using our installer script:

```bash
# Using curl
curl -o- https://raw.githubusercontent.com/jonathanphilippou/bunenv/main/install.sh | bash

# Or using wget
wget -qO- https://raw.githubusercontent.com/jonathanphilippou/bunenv/main/install.sh | bash
```

This script will install bunenv and set up shell integration automatically.

### Install via Homebrew (macOS and Linux)

```bash
brew install jonathanphilippou/tap/bunenv

# Then set up shell integration
bunenv init >> ~/.bashrc  # or your appropriate shell config file
source ~/.bashrc
```

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

Contributions are welcome! Please feel free to submit a Pull Request.

### Getting Started

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

We follow these conventions:

- Use TypeScript for type safety
- Follow consistent naming conventions
- Include JSDoc comments for public APIs
- Write unit tests for new functionality

### Pull Request Process

1. Ensure your code passes all tests (`bun test`)
2. Update documentation if needed
3. Include a clear description of the changes
4. Reference any related issues in your PR description

### Roadmap and Future Features

We're planning to add:

- Support for more shell types
- Version range specifications
- Plugin system for extensions
- Interactive version installation

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
