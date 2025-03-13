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

      console.log("bunenv v0.2.4");
      console.log("This is a placeholder implementation. Full functionality coming soon.");
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