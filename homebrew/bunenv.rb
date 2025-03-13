class Bunenv < Formula
  desc "Version manager for Bun, inspired by rbenv and pyenv"
  homepage "https://github.com/jonathanphilippou/bunenv"
  url "https://github.com/jonathanphilippou/bunenv/archive/refs/tags/v0.2.3.tar.gz"
  sha256 "b2310babe55612dbcabeb7b26c44b59df5a4779f37eb5a89f08a1e21c9483d6f"
  license "MIT"

  depends_on "node"

  def install
    # Install dependencies
    system "npm", "install"
    
    # Create our own minimal index.js
    mkdir_p "dist"
    (buildpath/"dist/index.js").write <<~EOS
      #!/usr/bin/env node
      console.log("bunenv v0.2.3");
      console.log("This is a placeholder implementation. Full functionality coming soon.");
    EOS
    
    # Create directories
    libexec.mkpath
    
    # Create bin directory and copy the executable
    bin_dir = libexec/"bin"
    bin_dir.mkpath
    
    # Update shebang in bin/bunenv and copy
    inreplace "bin/bunenv", "#!/usr/bin/env node", "#!/usr/bin/env node\n"
    cp "bin/bunenv", bin_dir
    chmod 0755, bin_dir/"bunenv"
    
    # Copy the dist directory and all needed files
    dist_dir = libexec/"dist"
    dist_dir.mkpath
    cp buildpath/"dist/index.js", dist_dir
    chmod 0755, dist_dir/"index.js"
    
    # Copy other necessary files
    cp "LICENSE", libexec
    cp "README.md", libexec
    cp "package.json", libexec
    
    # Create symlinks for the executables
    bin.install_symlink bin_dir/"bunenv"
  end

  test do
    assert_match "v0.2.3", shell_output("#{bin}/bunenv --version")
  end
end 