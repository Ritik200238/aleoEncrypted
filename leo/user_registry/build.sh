#!/bin/bash
# Build script for user_registry.aleo

set -e

echo "=========================================="
echo "Building user_registry.aleo"
echo "=========================================="

# Navigate to contract directory
cd "$(dirname "$0")"

# Check if Leo is installed
if ! command -v leo &> /dev/null; then
    echo "Error: Leo compiler not found"
    echo "Please install Leo: https://developer.aleo.org/leo/installation"
    exit 1
fi

# Clean previous build
echo "Cleaning previous build..."
rm -rf build/

# Build the contract
echo "Building contract..."
leo build

# Check if build was successful
if [ -d "build" ]; then
    echo ""
    echo "=========================================="
    echo "Build successful!"
    echo "=========================================="
    echo ""
    echo "Build artifacts:"
    ls -lh build/
    echo ""
    echo "Next steps:"
    echo "1. Deploy to testnet: leo deploy --network testnet"
    echo "2. Update PROGRAM_IDS in frontend/src/services/userRegistryService.ts"
    echo "3. Test transitions: leo run <transition_name> <args>"
    echo ""
else
    echo ""
    echo "Build failed!"
    exit 1
fi
