#!/usr/bin/env node
/**
 * Setup and Deploy Helper for EncryptedSocial
 * Generates account, provides funding instructions, and deploys contracts
 */

import { Account } from '@provablehq/sdk';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

console.log('🚀 EncryptedSocial - Setup & Deploy Helper\n');

async function checkSDKInstalled() {
    try {
        await import('@provablehq/sdk');
        console.log('✅ Aleo SDK installed\n');
        return true;
    } catch (error) {
        console.error('❌ Aleo SDK not installed!');
        console.error('Install with: npm install @provablehq/sdk\n');
        return false;
    }
}

async function generateOrLoadAccount() {
    console.log('📋 STEP 1: Account Setup');
    console.log('='.repeat(60));

    // Check if private key is in environment
    if (process.env.ALEO_PRIVATE_KEY) {
        try {
            const account = new Account({ privateKey: process.env.ALEO_PRIVATE_KEY });
            console.log('✅ Using account from ALEO_PRIVATE_KEY environment variable');
            console.log(`   Address: ${account.address().toString()}\n`);
            return account;
        } catch (error) {
            console.error('❌ Invalid private key in ALEO_PRIVATE_KEY');
        }
    }

    // Generate new account
    console.log('🔑 Generating new Aleo account...\n');
    const account = Account.from_string(process.env.ALEO_PRIVATE_KEY || new Account().to_string());

    console.log('✅ Account Generated!');
    console.log('\n⚠️  SAVE THESE CREDENTIALS SECURELY!\n');
    console.log('Private Key:');
    console.log(`   ${account.privateKey()}`);
    console.log(`\nAddress:`);
    console.log(`   ${account.address()}`);
    console.log('\n' + '='.repeat(60));

    return account;
}

async function checkFunding(address) {
    console.log('\n💰 STEP 2: Fund Your Account');
    console.log('='.repeat(60));
    console.log('\nYour account needs Aleo testnet credits to deploy contracts.');
    console.log('\n📍 Get testnet credits:');
    console.log('1. Go to: https://faucet.aleo.org');
    console.log(`2. Enter your address: ${address}`);
    console.log('3. Complete verification and request credits');
    console.log('4. Wait 1-2 minutes for credits to arrive');
    console.log('\n💡 You need ~10 Aleo credits total for all 3 contracts');
    console.log('='.repeat(60));

    console.log('\n⏸️  Press Enter after funding your account...');
    // Wait for user input
    if (process.stdin.isTTY) {
        await new Promise(resolve => {
            process.stdin.once('data', () => resolve());
        });
    }
}

async function deployContracts(privateKey) {
    console.log('\n🚀 STEP 3: Deploy Contracts');
    console.log('='.repeat(60));
    console.log('\nStarting deployment process...\n');

    try {
        // Set private key in environment
        process.env.ALEO_PRIVATE_KEY = privateKey;

        // Run deployment script
        const deployScript = './deploy-all-contracts.mjs';
        console.log(`Executing: node ${deployScript}\n`);

        execSync(`node ${deployScript}`, {
            stdio: 'inherit',
            env: process.env,
        });

    } catch (error) {
        console.error('\n❌ Deployment failed');
        console.error('Error:', error.message);
        return false;
    }

    return true;
}

async function main() {
    // Check SDK
    const sdkInstalled = await checkSDKInstalled();
    if (!sdkInstalled) {
        process.exit(1);
    }

    // Generate/load account
    const account = await generateOrLoadAccount();

    // Check if deploying or just generating account
    const args = process.argv.slice(2);
    const skipFunding = args.includes('--skip-funding');
    const accountOnly = args.includes('--account-only');

    if (accountOnly) {
        console.log('\n✅ Account generated. Exiting (--account-only flag).\n');
        console.log('To deploy, run:');
        console.log(`ALEO_PRIVATE_KEY="${account.privateKey()}" node deploy-all-contracts.mjs\n`);
        return;
    }

    // Check funding
    if (!skipFunding) {
        await checkFunding(account.address());
    }

    // Deploy contracts
    const success = await deployContracts(account.privateKey());

    if (success) {
        console.log('\n✅ Setup and deployment complete!\n');
    } else {
        console.log('\n⚠️  Deployment incomplete. Check errors above.\n');
        process.exit(1);
    }
}

// Run
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
