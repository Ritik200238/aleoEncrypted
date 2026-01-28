#!/bin/bash
# Build script for group_membership.aleo

echo "Building group_membership.aleo..."
leo build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "Contract features:"
    echo "  - Real Merkle tree verification (8 levels, 256 members)"
    echo "  - ZK membership proofs with path traversal"
    echo "  - Nullifier system for replay prevention"
    echo "  - Anonymous feedback submission"
    echo ""
    echo "Next steps:"
    echo "  1. Test locally: leo run create_group ..."
    echo "  2. Deploy to testnet: leo deploy --network testnet"
else
    echo "❌ Build failed!"
    exit 1
fi
