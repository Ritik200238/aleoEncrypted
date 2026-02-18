#!/usr/bin/env node
/**
 * Production Deployment Script for EncryptedSocial
 * Deploys all 3 Leo contracts to Aleo Testnet
 *
 * Usage:
 *   node deploy-all-contracts.mjs
 *
 * Reads ALEO_PRIVATE_KEY from .env file (or existing environment variable).
 * Copy .env.example to .env and fill in your key before running.
 */

// Load .env file if present (dotenv)
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
try {
  const { config } = require('dotenv');
  config();
} catch {
  // dotenv not installed — rely on environment variables already set
}

import { Account, AleoNetworkClient, ProgramManager, AleoKeyProvider } from '@provablehq/sdk';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Contract configurations
const CONTRACTS = [
    {
        name: 'group_manager',
        path: 'leo/group_manager/build/main.aleo',
        fee: 3000000, // 3 Aleo credits
    },
    {
        name: 'membership_proof',
        path: 'leo/membership_proof/build/main.aleo',
        fee: 2000000, // 2 Aleo credits
    },
    {
        name: 'message_handler',
        path: 'leo/message_handler/build/main.aleo',
        fee: 3000000, // 3 Aleo credits
    },
];

const NETWORK_URL = 'https://api.explorer.provable.com/v1';
const DEPLOYMENT_RESULTS_FILE = 'deployment-results.json';

async function deployContract(programManager, contract) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 Deploying: ${contract.name}.aleo`);
    console.log(`${'='.repeat(60)}`);

    try {
        // Read program code
        const programPath = join(process.cwd(), contract.path);
        const programCode = readFileSync(programPath, 'utf8');

        console.log(`✅ Loaded ${contract.name}.aleo`);
        console.log(`   Size: ${(programCode.length / 1024).toFixed(2)} KB`);
        console.log(`   Fee: ${contract.fee / 1000000} Aleo credits\n`);

        console.log('📡 Broadcasting deployment transaction...');

        // Deploy with retries
        let txId;
        let attempt = 0;
        const maxAttempts = 3;

        while (attempt < maxAttempts) {
            try {
                attempt++;
                console.log(`   Attempt ${attempt}/${maxAttempts}...`);

                txId = await programManager.deploy(programCode, contract.fee);

                console.log(`\n✅ Transaction broadcast successful!`);
                console.log(`   TX ID: ${txId}`);
                console.log(`   Explorer: https://explorer.aleo.org/transaction/${txId}`);

                break;
            } catch (error) {
                console.error(`   ❌ Attempt ${attempt} failed: ${error.message}`);

                if (attempt < maxAttempts) {
                    const waitTime = attempt * 10;
                    console.log(`   ⏳ Waiting ${waitTime} seconds before retry...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
                } else {
                    throw error;
                }
            }
        }

        return {
            name: contract.name,
            programId: `${contract.name}.aleo`,
            txId,
            status: 'deployed',
            timestamp: new Date().toISOString(),
            explorerUrl: `https://explorer.aleo.org/transaction/${txId}`,
        };

    } catch (error) {
        console.error(`\n❌ Deployment of ${contract.name} failed:`);
        console.error(`   Error: ${error.message}`);

        return {
            name: contract.name,
            programId: `${contract.name}.aleo`,
            status: 'failed',
            error: error.message,
            timestamp: new Date().toISOString(),
        };
    }
}

async function main() {
    console.log('🚀 EncryptedSocial - Aleo Contract Deployment');
    console.log('='.repeat(60));
    console.log('Network: Aleo Testnet');
    console.log('Contracts to deploy: 3');
    console.log('='.repeat(60));

    // Check for private key
    const privateKey = process.env.ALEO_PRIVATE_KEY;

    if (!privateKey) {
        console.error('\n❌ ERROR: ALEO_PRIVATE_KEY environment variable not set!');
        console.error('\nUsage:');
        console.error('  ALEO_PRIVATE_KEY=<your_private_key> node deploy-all-contracts.mjs');
        console.error('\nOr for testing (INSECURE - testnet only):');
        console.error('  ALEO_PRIVATE_KEY=APrivateKey1zkp... node deploy-all-contracts.mjs\n');
        process.exit(1);
    }

    try {
        // Initialize account
        console.log('\n1. Initializing account...');
        const account = new Account({ privateKey });
        console.log(`   ✅ Address: ${account.address().toString()}`);

        // Initialize key provider
        console.log('\n2. Initializing key provider...');
        const keyProvider = new AleoKeyProvider();
        keyProvider.useCache(true);
        console.log('   ✅ Key provider ready');

        // Initialize program manager
        console.log('\n3. Initializing program manager...');
        const programManager = new ProgramManager(
            NETWORK_URL,
            keyProvider,
            undefined
        );
        programManager.setAccount(account);
        console.log(`   ✅ Connected to ${NETWORK_URL}`);

        // Deploy all contracts
        console.log('\n4. Starting contract deployment...\n');
        const deploymentResults = [];

        for (const contract of CONTRACTS) {
            const result = await deployContract(programManager, contract);
            deploymentResults.push(result);

            // Wait between deployments to avoid rate limiting
            if (contract !== CONTRACTS[CONTRACTS.length - 1]) {
                console.log('\n⏳ Waiting 30 seconds before next deployment...');
                await new Promise(resolve => setTimeout(resolve, 30000));
            }
        }

        // Save results
        const resultsPath = join(process.cwd(), DEPLOYMENT_RESULTS_FILE);
        writeFileSync(resultsPath, JSON.stringify({
            network: 'testnet',
            timestamp: new Date().toISOString(),
            deployerAddress: account.address().toString(),
            contracts: deploymentResults,
        }, null, 2));

        console.log(`\n${'='.repeat(60)}`);
        console.log('📊 DEPLOYMENT SUMMARY');
        console.log(`${'='.repeat(60)}`);

        const successful = deploymentResults.filter(r => r.status === 'deployed').length;
        const failed = deploymentResults.filter(r => r.status === 'failed').length;

        console.log(`\n✅ Successful: ${successful}/${CONTRACTS.length}`);
        console.log(`❌ Failed: ${failed}/${CONTRACTS.length}`);
        console.log(`\n📁 Results saved to: ${DEPLOYMENT_RESULTS_FILE}`);

        if (successful === CONTRACTS.length) {
            console.log('\n🎉 ALL CONTRACTS DEPLOYED SUCCESSFULLY!');
            console.log('\nNext steps:');
            console.log('1. Wait 2-5 minutes for blockchain confirmation');
            console.log('2. Verify on explorer: https://explorer.aleo.org');
            console.log('3. Update frontend config with program IDs');
            console.log('4. Test contract interactions\n');
            process.exit(0);
        } else {
            console.log('\n⚠️  SOME DEPLOYMENTS FAILED');
            console.log('\nCheck the error messages above and:');
            console.log('1. Verify your account has sufficient credits');
            console.log('2. Check network status at https://explorer.aleo.org');
            console.log('3. Review failed contracts and retry\n');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n❌ FATAL ERROR:');
        console.error(error.message);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
}

// Run deployment
main().catch(error => {
    console.error('Uncaught error:', error);
    process.exit(1);
});
