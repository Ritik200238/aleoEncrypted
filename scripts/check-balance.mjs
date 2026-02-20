#!/usr/bin/env node
/**
 * Check Aleo testnet balance
 */

import { Account, AleoNetworkClient } from '@provablehq/sdk';

const PRIVATE_KEY = 'APrivateKey1zkp5hoG5dwv5jw2PxNZTkbnkChwHMMY4YDUkGmFmA2AJQS9';
const NETWORK_URL = 'https://api.explorer.provable.com/v1';

async function checkBalance() {
    try {
        console.log('🔍 Checking Aleo Testnet Balance...\n');

        const account = new Account({ privateKey: PRIVATE_KEY });
        const address = account.address().toString();

        console.log(`Address: ${address}\n`);

        const networkClient = new AleoNetworkClient(NETWORK_URL);

        console.log('Fetching balance...');

        // Try to get balance (this might not work with all API endpoints)
        try {
            const balance = await networkClient.getBalance(address);
            console.log(`\n✅ Balance: ${balance} credits\n`);

            if (balance > 3000000) {
                console.log('🎉 You have enough credits to deploy!\n');
                console.log('Run: node deploy-group-membership.mjs');
            } else {
                console.log('⚠️  Insufficient credits for deployment');
                console.log('   Need: 3,000,000 (3 credits)');
                console.log(`   Have: ${balance}\n`);
                console.log('Get more credits at: https://faucet.aleo.org');
            }
        } catch (balanceError) {
            console.log('\n⚠️  Could not fetch balance from API');
            console.log('   This is normal - testnet APIs can be unreliable\n');
            console.log('💡 Instead:');
            console.log('   1. Visit: https://explorer.aleo.org');
            console.log(`   2. Search for: ${address}`);
            console.log('   3. Check your balance there\n');
            console.log('   OR just try deploying - if you have credits, it will work!');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkBalance();
