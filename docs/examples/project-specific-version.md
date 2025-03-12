# Project-Specific Bun Version Management

This guide shows how to set up and manage a Bun version for a specific project using bunenv.

## Why Use Project-Specific Versions?

Using project-specific versions of Bun has several advantages:

1. **Consistency across team members** - Everyone working on the project uses the same Bun version
2. **Stability** - Your project always runs with the same Bun version, regardless of global settings
3. **Portability** - The project is more portable across different development environments
4. **Compatibility** - Ensures libraries and dependencies work with the specific Bun version

## Setting Up a Project with bunenv

### Step 1: Initialize a New Project

First, create a new directory for your project:

```bash
mkdir my-bun-project
cd my-bun-project
```

### Step 2: Set the Local Bun Version

Use bunenv to specify which Bun version this project should use:

```bash
# Install the desired Bun version if not already installed
bunenv install 1.0.22

# Set it as the local version for this project
bunenv local 1.0.22
```

This creates a `.bun-version` file in your project directory containing the version number.

### Step 3: Verify the Setup

Check that the correct version is being used:

```bash
bunenv version
# Output: 1.0.22 (set by /path/to/my-bun-project/.bun-version)
```

You can also verify the actual Bun version:

```bash
bun --version
# Output: 1.0.22
```

### Step 4: Initialize Your Bun Project

Now you can initialize your Bun project with the correct version:

```bash
bun init
```

## Working with Project-Specific Versions

### Automatic Version Switching

With bunenv properly set up, it will automatically switch to the correct Bun version whenever you navigate to your project directory:

```bash
# Navigate to a directory using Bun 1.0.0
cd ~/project-a
bunenv version  # Shows 1.0.0

# Navigate to your project using Bun 1.0.22
cd ~/my-bun-project
bunenv version  # Shows 1.0.22
```

### Adding the .bun-version File to Version Control

It's good practice to commit the `.bun-version` file to your version control system:

```bash
# For Git
git add .bun-version
git commit -m "Set Bun version to 1.0.22"
```

This ensures all collaborators will use the same Bun version when working on the project.

### Changing the Project's Bun Version

If you need to update the Bun version for the project:

```bash
# Install the new version
bunenv install 1.0.23

# Update the local version
bunenv local 1.0.23

# Verify the change
bunenv version
# Output: 1.0.23 (set by /path/to/my-bun-project/.bun-version)
```

Don't forget to commit the updated `.bun-version` file to your version control system.

## Example: Building and Running a Project

Here's a complete workflow example:

```bash
# Create a new project directory
mkdir bun-express-example
cd bun-express-example

# Set and install the Bun version
bunenv install 1.0.22
bunenv local 1.0.22

# Initialize a new Bun project
bun init

# Install Express
bun add express

# Create a simple server (app.ts)
echo 'import express from "express";
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello from Bun " + Bun.version);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});' > app.ts

# Run the server
bun run app.ts
```

## Best Practices

1. **Always create a `.bun-version` file** for each project
2. **Commit the `.bun-version` file** to your version control system
3. **Document the required Bun version** in your project's README.md
4. **Use a version that's compatible** with all your dependencies
5. **Test your project against newer Bun versions** periodically to ensure compatibility

## Troubleshooting

### Common Issues

1. **Version not switching automatically**

   - Make sure bunenv is properly set up with shell integration
   - Verify that the `.bun-version` file exists and contains a valid version number

2. **"Version not installed" error**

   - Install the required version: `bunenv install <version>`

3. **Bun command not found**
   - Ensure bunenv shims are in your PATH
   - Try running `bunenv rehash` to rebuild the shims
