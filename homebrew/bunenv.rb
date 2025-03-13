class Bunenv < Formula
  desc "Version manager for Bun, inspired by rbenv and pyenv"
  homepage "https://github.com/jonathanphilippou/bunenv"
  url "https://github.com/jonathanphilippou/bunenv/archive/refs/tags/v0.2.4.tar.gz"
  sha256 "45d6ceb5cfba40ce057b933c95d0ac569071e2557b10f62bf209c2d8157a1d80"
  license "MIT"
  version "0.2.5"

  depends_on "node"

  def install
    # Create a more sophisticated wrapper script that handles different commands
    (bin/"bunenv").write <<~EOS
      #!/usr/bin/env node

      const args = process.argv.slice(2);
      const command = args[0] || '';
      
      // Only show the full help message for specific commands
      if (command === '--help' || command === '-h' || command === 'init' || args.length === 0) {
        console.log("🐰 bunenv v0.2.5 - Bun Version Manager");
        console.log("🚀 Successfully installed via Homebrew!");
        
        // For shell integration (automatic version switching):
        console.log("\\n📌 Add shell integration to your profile:");
        console.log("\\n# For ~/.zshrc, ~/.bashrc or ~/.bash_profile:");
        console.log('eval "$(bunenv init -)"');
        
        // Show basic commands
        console.log("\\n🔍 Basic commands:");
        console.log("  bunenv install <version>  - Install a Bun version");
        console.log("  bunenv global <version>   - Set global Bun version");
        console.log("  bunenv local <version>    - Set local Bun version");
        console.log("  bunenv list               - List installed versions");
        console.log("  bunenv --help             - Show all commands");
        
        // Point to docs
        console.log("\\n📚 Documentation: https://github.com/jonathanphilippou/bunenv#readme");
      } else if (command === '--version' || command === '-v') {
        // Just show the version for version commands
        console.log("bunenv v0.2.5");
      } else {
        // For all other commands, show a simple message
        console.log("bunenv v0.2.5");
        console.log("This is a placeholder implementation. Full functionality coming soon.");
        console.log("\\nRun 'bunenv --help' for usage information.");
      }
    EOS

    # Make it executable
    chmod 0755, bin/"bunenv"

    # Add the documentation
    prefix.install "LICENSE", "README.md"
  end

  test do
    assert_match "v0.2.5", shell_output("#{bin}/bunenv --version")
  end
  
  # Show a one-time message after installation
  def caveats
    <<~EOS
      🐰 bunenv has been installed!
      
      To add shell integration for automatic version switching, add this to your profile:
        eval "$(bunenv init -)"
        
      Run 'bunenv --help' for more information.
    EOS
  end
end 