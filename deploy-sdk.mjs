// Aleo SDK Deployment Script (ESM)
import { Account, AleoNetworkClient, ProgramManager, AleoKeyProvider } from '@provablehq/sdk';
import { readFileSync } from 'fs';

async function deploy() {
    try {
        console.log('🚀 Starting deployment with Aleo SDK...\n');

        // Initialize account with private key
        const privateKey = 'APrivateKey1zkp39dzxgoz6d3hMFE9BSB9uJTLyMVbrHk8Ad5vfzZ7XNu5';
        const account = new Account({ privateKey });
        console.log(`✅ Account loaded: ${account.address().toString()}`);

        // Initialize key provider
        const keyProvider = new AleoKeyProvider();
        keyProvider.useCache(true);

        // Initialize program manager
        const programManager = new ProgramManager(
            'https://api.explorer.provable.com/v1',
            keyProvider,
            undefined
        );
        programManager.setAccount(account);
        console.log('✅ Program manager initialized\n');

        // Read program code
        const programCode = readFileSync('D:\\buildathon\\encrypted-social-aleo\\leo\\group_manager\\build\\main.aleo', 'utf8');
        console.log('✅ Loaded group_manager.aleo program');
        console.log(`   Program size: ${(programCode.length / 1024).toFixed(2)} KB\n`);

        // Deploy with fixed fee (based on earlier calculation: 2.956962 credits)
        const fee = 3000000; // 3 credits in microcredits
        console.log(`💰 Using deployment fee: ${fee / 1000000} credits\n`);

        console.log('📡 Broadcasting deployment transaction...');
        const txId = await programManager.deploy(programCode, fee);

        console.log(`\n🎉 SUCCESS! Transaction broadcast!`);
        console.log(`   Transaction ID: ${txId}`);
        console.log(`   Explorer: https://explorer.aleo.org/transaction/${txId}`);
        console.log(`\n⏳ Waiting for confirmation (2-5 minutes)...`);

        return txId;

    } catch (error) {
        console.error('\n❌ Deployment failed:');
        console.error(error.message);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
}

deploy();
