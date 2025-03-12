# bunenv Architecture Diagram

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

## Improved File Structure

The new file structure will better reflect this architecture:

```
bunenv/
├── bin/
│   └── bunenv                    # Main entry point script
│
├── src/
│   ├── core/                     # Core system components
│   │   ├── config.ts             # Configuration and constants
│   │   ├── paths.ts              # Path management and standardization
│   │   └── environment.ts        # Environment detection (OS, shell, etc.)
│   │
│   ├── shims/                    # Shim management
│   │   ├── index.ts              # Main shim module exports
│   │   ├── generator.ts          # Shim script generation
│   │   ├── installer.ts          # Shim installation/rehashing
│   │   └── templates/            # Templates for different shells
│   │       ├── bash.ts           # Bash shim template
│   │       └── zsh.ts            # Zsh shim template
│   │
│   ├── versions/                 # Version management
│   │   ├── index.ts              # Main version module exports
│   │   ├── installer.ts          # Version download and installation
│   │   ├── resolver.ts           # Version resolution logic
│   │   ├── loader.ts             # Loading/activating versions
│   │   └── system.ts             # System version fallbacks
│   │
│   ├── cli/                      # Command line interface
│   │   ├── index.ts              # CLI setup and command registration
│   │   ├── commands/             # Command implementations
│   │   │   ├── install.ts        # Install command
│   │   │   ├── global.ts         # Global command
│   │   │   ├── local.ts          # Local command
│   │   │   ├── rehash.ts         # Rehash command
│   │   │   ├── list.ts           # List command
│   │   │   ├── version.ts        # Version command
│   │   │   ├── shell.ts          # Shell command
│   │   │   └── init.ts           # Init command
│   │   └── utils/                # CLI utilities
│   │       ├── output.ts         # Console output formatting
│   │       └── validation.ts     # Input validation
│   │
│   ├── utils/                    # Shared utilities
│   │   ├── download.ts           # Download utilities
│   │   ├── fs.ts                 # File system helpers
│   │   ├── platform.ts           # Platform-specific utilities
│   │   └── errors.ts             # Error handling
│   │
│   └── index.ts                  # Main entry point
│
├── test/                         # Tests follow test pyramid structure
│   ├── integration/              # High level end-to-end tests
│   ├── component/                # Mid-level component tests
│   └── unit/                     # Low-level unit tests
│       ├── core/
│       ├── shims/
│       ├── versions/
│       ├── cli/
│       └── utils/
```
