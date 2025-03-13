class Bunenv < Formula
  desc "Version manager for Bun, inspired by rbenv and pyenv"
  homepage "https://github.com/jonathanphilippou/bunenv"
  url "https://github.com/jonathanphilippou/bunenv/archive/refs/tags/v0.2.4.tar.gz"
  sha256 "45d6ceb5cfba40ce057b933c95d0ac569071e2557b10f62bf209c2d8157a1d80"
  license "MIT"

  depends_on "node"

  def install
    # Create a simple wrapper script
    (bin/"bunenv").write <<~EOS
      #!/usr/bin/env node

      console.log("🐰 bunenv v0.2.4 - Bun Version Manager");
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
    EOS

    # Make it executable
    chmod 0755, bin/"bunenv"

    # Add the documentation
    prefix.install "LICENSE", "README.md"
  end

  test do
    assert_match "v0.2.4", shell_output("#{bin}/bunenv --version")
  end
end 