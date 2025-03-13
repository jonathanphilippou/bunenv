class Bunenv < Formula
  desc "Version manager for Bun, inspired by rbenv and pyenv"
  homepage "https://github.com/jonathanphilippou/bunenv"
  url "https://registry.npmjs.org/bunenv/-/bunenv-0.2.3.tgz"
  sha256 "d706dda1ea39c6daca07f6f7e1a06b85366b65fbcca7e204e5ecffcb59415e90"
  license "MIT"

  depends_on "node"

  def install
    # Install the package to libexec
    system "npm", "install", "--prefix=#{libexec}", "."
    
    # Extract the package to access its structure
    system "npm", "pack", "bunenv@0.2.2", "--silent"
    system "tar", "-xzf", "bunenv-0.2.2.tgz"
    
    # Install the bin directory directly to ensure the executable works
    bin_dir = libexec/"bin"
    bin_dir.mkpath
    
    # Copy the bunenv executable to the bin directory
    cp "package/bin/bunenv", bin_dir
    
    # Make the executable executable
    chmod 0755, bin_dir/"bunenv"
    
    # Create symlink to the executable
    bin.install_symlink bin_dir/"bunenv"
    
    # Clean up
    rm_rf "package"
    rm "bunenv-0.2.2.tgz"
  end

  test do
    system "#{bin}/bunenv", "--version"
  end
end 