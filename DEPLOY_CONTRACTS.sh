#!/bin/bash

# =====================================================
# Aleo Smart Contract Deployment Script
# EncryptedSocial - Deploy to Aleo Testnet
# =====================================================

set -e  # Exit on error

echo "========================================"
echo "🚀 EncryptedSocial Contract Deployment"
echo "========================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Leo is installed
if ! command -v leo &> /dev/null; then
    echo -e "${RED}❌ Leo CLI not found${NC}"
    echo ""
    echo "Please install Leo first:"
    echo "1. Install Rust: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    echo "2. Install Leo: cargo install --git https://github.com/AleoHQ/leo.git leo-lang"
    echo "3. Or follow: https://developer.aleo.org/leo/installation"
    exit 1
fi

echo -e "${GREEN}✓ Leo CLI found${NC}"
leo --version
echo ""

# Check for testnet credits
echo "Checking Aleo account..."
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found${NC}"
    echo "Creating new Aleo account..."
    leo account new
else
    echo -e "${GREEN}✓ Account configured${NC}"
fi
echo ""

# Get account address
ACCOUNT_ADDRESS=$(grep NETWORK .env | cut -d'"' -f2)
echo -e "Account: ${GREEN}${ACCOUNT_ADDRESS}${NC}"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANT: Make sure you have testnet credits!${NC}"
echo "Get credits from: https://faucet.aleo.org"
echo ""
read -p "Press Enter when you have credits (or Ctrl+C to cancel)..."
echo ""

# Contract directories
CONTRACTS=("group_manager" "membership_proof" "message_handler")
DEPLOYED_IDS=()

# Deploy each contract
for contract in "${CONTRACTS[@]}"; do
    echo "========================================"
    echo "📦 Deploying: ${contract}.aleo"
    echo "========================================"

    cd "leo/${contract}"

    # Clean previous build
    echo "Cleaning previous build..."
    rm -rf build/

    # Build contract
    echo "Building contract..."
    leo build || {
        echo -e "${RED}❌ Build failed for ${contract}${NC}"
        exit 1
    }
    echo -e "${GREEN}✓ Build successful${NC}"
    echo ""

    # Deploy to testnet
    echo "Deploying to Aleo testnet..."
    echo "This may take 2-5 minutes..."

    DEPLOY_OUTPUT=$(leo deploy --network testnet 2>&1) || {
        echo -e "${RED}❌ Deployment failed for ${contract}${NC}"
        echo "$DEPLOY_OUTPUT"
        exit 1
    }

    # Extract program ID
    PROGRAM_ID=$(echo "$DEPLOY_OUTPUT" | grep -oP "${contract}\.aleo/[a-zA-Z0-9]+" | head -1)

    if [ -z "$PROGRAM_ID" ]; then
        PROGRAM_ID="${contract}.aleo"
    fi

    DEPLOYED_IDS+=("$PROGRAM_ID")

    echo -e "${GREEN}✓ Deployed: ${PROGRAM_ID}${NC}"
    echo ""

    # Return to root
    cd ../..

    # Wait between deployments
    if [ "$contract" != "${CONTRACTS[-1]}" ]; then
        echo "Waiting 30 seconds before next deployment..."
        sleep 30
    fi
done

echo "========================================"
echo "✅ ALL CONTRACTS DEPLOYED SUCCESSFULLY!"
echo "========================================"
echo ""

# Save program IDs
echo "Deployed Program IDs:" > DEPLOYED_PROGRAM_IDS.txt
for i in "${!CONTRACTS[@]}"; do
    echo "${CONTRACTS[$i]}: ${DEPLOYED_IDS[$i]}" >> DEPLOYED_PROGRAM_IDS.txt
    echo -e "${GREEN}${CONTRACTS[$i]}: ${DEPLOYED_IDS[$i]}${NC}"
done
echo ""

# Update frontend configuration
echo "Updating frontend configuration..."

cat > frontend/src/config/aleoConfig.ts << EOF
/**
 * Aleo Network Configuration
 * AUTOMATICALLY GENERATED - DO NOT EDIT MANUALLY
 */

export const ALEO_CONFIG = {
  network: 'testnet',
  programIds: {
    groupManager: '${DEPLOYED_IDS[0]}',
    membershipProof: '${DEPLOYED_IDS[1]}',
    messageHandler: '${DEPLOYED_IDS[2]}',
  },
  explorerUrl: 'https://explorer.aleo.org',
  faucetUrl: 'https://faucet.aleo.org',
};

export const getExplorerUrl = (type: 'program' | 'transaction', id: string) => {
  return \`\${ALEO_CONFIG.explorerUrl}/\${type}/\${id}?network=testnet\`;
};
EOF

echo -e "${GREEN}✓ Frontend configuration updated${NC}"
echo ""

# Update leoContractService.ts
echo "Updating leoContractService.ts..."

sed -i "s/GROUP_MANAGER: '.*'/GROUP_MANAGER: '${DEPLOYED_IDS[0]}'/" \
    frontend/src/services/leoContractService.ts

sed -i "s/MEMBERSHIP_PROOF: '.*'/MEMBERSHIP_PROOF: '${DEPLOYED_IDS[1]}'/" \
    frontend/src/services/leoContractService.ts

sed -i "s/MESSAGE_HANDLER: '.*'/MESSAGE_HANDLER: '${DEPLOYED_IDS[2]}'/" \
    frontend/src/services/leoContractService.ts

echo -e "${GREEN}✓ leoContractService.ts updated${NC}"
echo ""

echo "========================================"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Verify deployments on explorer:"
for id in "${DEPLOYED_IDS[@]}"; do
    echo "   https://explorer.aleo.org/program/${id}?network=testnet"
done
echo ""
echo "2. Restart your frontend dev server"
echo "3. Test blockchain transactions in the app"
echo ""
echo "Program IDs saved to: DEPLOYED_PROGRAM_IDS.txt"
echo ""
