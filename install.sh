#!/usr/bin/env bash

# bunenv installer script
# This script installs bunenv and sets up basic shell integration

set -e

# Colors for output
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default install directory
BUNENV_ROOT="${BUNENV_ROOT:-$HOME/.bunenv}"

# Print a message with color
print_message() {
  local color=$1
  local message=$2
  echo -e "${color}${message}${NC}"
}

# Print an error message and exit
print_error() {
  print_message "${RED}" "Error: $1"
  exit 1
}

# Check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Detect shell type
detect_shell() {
  if [ -n "$SHELL" ]; then
    shell_name=$(basename "$SHELL")
    echo "$shell_name"
  elif command_exists bash; then
    echo "bash"
  elif command_exists zsh; then
    echo "zsh"
  elif command_exists fish; then
    echo "fish"
  else
    echo "unknown"
  fi
}

# Get shell config file
get_shell_config() {
  local shell=$1
  
  case "$shell" in
    bash)
      if [ -f "$HOME/.bashrc" ]; then
        echo "$HOME/.bashrc"
      elif [ -f "$HOME/.bash_profile" ]; then
        echo "$HOME/.bash_profile"
      else
        echo "$HOME/.profile"
      fi
      ;;
    zsh)
      echo "$HOME/.zshrc"
      ;;
    fish)
      mkdir -p "$HOME/.config/fish/conf.d"
      echo "$HOME/.config/fish/conf.d/bunenv.fish"
      ;;
    *)
      echo ""
      ;;
  esac
}

# Main installation function
install_bunenv() {
  print_message "${CYAN}" "Installing bunenv..."
  
  # Create directories
  mkdir -p "$BUNENV_ROOT/bin"
  mkdir -p "$BUNENV_ROOT/versions"
  mkdir -p "$BUNENV_ROOT/shims"
  
  # Check if npm or bun is available
  if command_exists npm; then
    print_message "${CYAN}" "Installing bunenv via npm..."
    npm install -g bunenv
  elif command_exists bun; then
    print_message "${CYAN}" "Installing bunenv via bun..."
    bun install -g bunenv
  else
    print_error "Neither npm nor bun is available. Please install one of them first."
  fi
  
  # Check if installation was successful
  if ! command_exists bunenv; then
    print_error "Installation failed. Please check the error messages above."
  fi
  
  print_message "${GREEN}" "bunenv installed successfully!"
}

# Setup shell integration
setup_shell_integration() {
  local shell=$(detect_shell)
  local config_file=$(get_shell_config "$shell")
  
  if [ -z "$config_file" ]; then
    print_message "${YELLOW}" "Could not determine shell config file. Please set up shell integration manually."
    return
  fi
  
  print_message "${CYAN}" "Setting up shell integration for $shell..."
  
  # Generate init script
  bunenv init --shell "$shell" > "$BUNENV_ROOT/bunenv-init"
  
  # Add to shell config if not already there
  if ! grep -q "bunenv" "$config_file"; then
    echo "" >> "$config_file"
    echo "# bunenv setup" >> "$config_file"
    echo "export BUNENV_ROOT=\"$BUNENV_ROOT\"" >> "$config_file"
    
    if [ "$shell" = "fish" ]; then
      echo "source $BUNENV_ROOT/bunenv-init" >> "$config_file"
    else
      echo "source \"\$BUNENV_ROOT/bunenv-init\"" >> "$config_file"
    fi
    
    print_message "${GREEN}" "Shell integration added to $config_file"
  else
    print_message "${YELLOW}" "Shell integration already exists in $config_file"
  fi
}

# Print final instructions
print_instructions() {
  local shell=$(detect_shell)
  local config_file=$(get_shell_config "$shell")
  
  print_message "${GREEN}" "bunenv has been installed successfully!"
  print_message "${CYAN}" "To complete setup, please run:"
  
  if [ -n "$config_file" ]; then
    print_message "${YELLOW}" "  source \"$config_file\""
  else
    print_message "${YELLOW}" "  source shell configuration file or restart your terminal"
  fi
  
  print_message "${CYAN}" "Then you can start using bunenv:"
  print_message "${YELLOW}" "  bunenv --version"
  print_message "${YELLOW}" "  bunenv install 1.0.22"
  print_message "${YELLOW}" "  bunenv global 1.0.22"
}

# Run the installation
main() {
  # Check if bunenv is already installed
  if command_exists bunenv; then
    print_message "${YELLOW}" "bunenv is already installed. Updating..."
  fi
  
  install_bunenv
  setup_shell_integration
  print_instructions
}

main "$@" 