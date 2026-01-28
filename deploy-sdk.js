// Aleo SDK Deployment Script
const { Account, AleoNetworkClient, ProgramManager, AleoKeyProvider } = require('@provablehq/sdk');

async function deploy() {
    try {
        console.log('🚀 Starting deployment with Aleo SDK...\n');

        // Initialize account with private key
        const privateKey = 'APrivateKey1zkp39dzxgoz6d3hMFE9BSB9uJTLyMVbrHk8Ad5vfzZ7XNu5';
        const account = new Account({ privateKey });
        console.log(`✅ Account loaded: ${account.address()}`);

        // Initialize network client
        const networkClient = new AleoNetworkClient('https://api.explorer.provable.com/v1');
        console.log('✅ Connected to testnet\n');

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

        // Read program code
        const fs = require('fs');
        const programCode = fs.readFileSync('D:\\buildathon\\encrypted-social-aleo\\leo\\group_manager\\build\\main.aleo', 'utf8');
        console.log('✅ Loaded group_manager.aleo program\n');

        // Estimate fee
        console.log('💰 Estimating deployment fee...');
        const fee = await programManager.estimateDeploymentFee(programCode);
        console.log(`   Fee estimate: ${fee} credits\n`);

        // Deploy program
        console.log('📡 Broadcasting deployment transaction...');
        const txId = await programManager.deploy(programCode, fee);

        console.log(`\n🎉 SUCCESS! Transaction broadcast!`);
        console.log(`   Transaction ID: ${txId}`);
        console.log(`   Explorer: https://explorer.aleo.org/transaction/${txId}`);
        console.log(`\n⏳ Waiting for confirmation (2-5 minutes)...`);

    } catch (error) {
        console.error('\n❌ Deployment failed:');
        console.error(error.message);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
}

deploy();
