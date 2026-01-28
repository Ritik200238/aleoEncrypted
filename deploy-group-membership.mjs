#!/usr/bin/env node
/**
 * Deploy group_membership.aleo to Aleo Testnet
 * Uses Provable SDK for deployment
 */

import { Account, AleoNetworkClient, ProgramManager, AleoKeyProvider } from '@provablehq/sdk';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const NETWORK_URL = 'https://api.explorer.provable.com/v1';
const PRIVATE_KEY = 'APrivateKey1zkp5hoG5dwv5jw2PxNZTkbnkChwHMMY4YDUkGmFmA2AJQS9';

async function deployContract() {
    console.log('🚀 Starting Deployment of group_membership.aleo\n');
    console.log('=' .repeat(60));

    try {
        // Initialize account
        console.log('📋 Step 1: Initializing account...');
        const account = new Account({ privateKey: PRIVATE_KEY });
        const address = account.address();
        console.log(`✅ Account Address: ${address}\n`);

        // Initialize network client
        console.log('📋 Step 2: Connecting to Aleo testnet...');
        const networkClient = new AleoNetworkClient(NETWORK_URL);
        console.log('✅ Connected to testnet\n');

        // Initialize program manager
        console.log('📋 Step 3: Initializing program manager...');
        const keyProvider = new AleoKeyProvider();
        keyProvider.useCache = true;

        const programManager = new ProgramManager(
            NETWORK_URL,
            keyProvider,
            undefined
        );

        // Set account
        programManager.setAccount(account);
        console.log('✅ Program manager ready\n');

        // Read contract code
        console.log('📋 Step 4: Reading contract code...');
        const contractPath = join(process.cwd(), 'leo', 'group_membership', 'src', 'main.leo');

        let programCode;
        try {
            programCode = readFileSync(contractPath, 'utf8');
            console.log(`✅ Loaded contract (${(programCode.length / 1024).toFixed(2)} KB)\n`);
        } catch (error) {
            console.error('❌ Failed to read contract file');
            console.error(`   Path: ${contractPath}`);
            console.error(`   Error: ${error.message}`);
            process.exit(1);
        }

        // Display contract info
        console.log('📊 Contract Details:');
        console.log(`   Program: group_membership.aleo`);
        console.log(`   Size: ${programCode.length} bytes`);
        console.log(`   Transitions: 8`);
        console.log(`   Mappings: 5`);
        console.log('');

        // Deploy
        console.log('📋 Step 5: Deploying to testnet...');
        console.log('⏳ This may take 2-5 minutes. Please wait...\n');

        const fee = 3000000; // 3 Aleo credits
        console.log(`   Fee: ${fee / 1000000} Aleo credits`);

        let txId;
        try {
            txId = await programManager.deploy(programCode, fee);

            console.log('\n🎉 DEPLOYMENT SUCCESSFUL!\n');
            console.log('=' .repeat(60));
            console.log('📝 Deployment Details:');
            console.log(`   Transaction ID: ${txId}`);
            console.log(`   Explorer: https://explorer.aleo.org/transaction/${txId}`);
            console.log(`   Program ID: group_membership.aleo`);
            console.log('=' .repeat(60));

            // Save deployment info
            const deploymentInfo = {
                programId: 'group_membership.aleo',
                transactionId: txId,
                explorerUrl: `https://explorer.aleo.org/transaction/${txId}`,
                deployedBy: address,
                deployedAt: new Date().toISOString(),
                network: 'testnet3',
                fee: fee,
                status: 'deployed'
            };

            const outputPath = join(process.cwd(), 'deployment-info.json');
            writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));

            console.log(`\n✅ Deployment info saved to: deployment-info.json\n`);

            console.log('🔍 Next Steps:');
            console.log('   1. Wait 30-60 seconds for confirmation');
            console.log('   2. Visit the explorer URL above');
            console.log('   3. Verify status shows "Confirmed"');
            console.log('   4. Take screenshot for submission!');
            console.log('');

            return deploymentInfo;

        } catch (deployError) {
            console.error('\n❌ DEPLOYMENT FAILED\n');
            console.error('=' .repeat(60));
            console.error('Error Details:');
            console.error(`   Message: ${deployError.message}`);

            if (deployError.message.includes('insufficient')) {
                console.error('\n💡 Possible Solutions:');
                console.error('   1. Get testnet credits from https://faucet.aleo.org');
                console.error('   2. Wait a few minutes and try again');
                console.error('   3. Check your balance on explorer');
            } else if (deployError.message.includes('already exists')) {
                console.error('\n💡 Note:');
                console.error('   Program already deployed! This is actually good news.');
                console.error('   You can skip to testing the deployed contract.');
            } else {
                console.error('\n💡 Troubleshooting:');
                console.error('   1. Check network connection');
                console.error('   2. Verify private key is correct');
                console.error('   3. Try again in a few minutes');
            }
            console.error('=' .repeat(60));

            process.exit(1);
        }

    } catch (error) {
        console.error('\n❌ UNEXPECTED ERROR\n');
        console.error('=' .repeat(60));
        console.error(`Error: ${error.message}`);
        console.error(`Stack: ${error.stack}`);
        console.error('=' .repeat(60));
        process.exit(1);
    }
}

// Run deployment
console.log('\n');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   ALEO BUILDATHON - GROUP MEMBERSHIP CONTRACT DEPLOYMENT   ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('\n');

deployContract()
    .then((info) => {
        console.log('\n✅ DEPLOYMENT COMPLETE!\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Deployment script failed:', error.message);
        process.exit(1);
    });
