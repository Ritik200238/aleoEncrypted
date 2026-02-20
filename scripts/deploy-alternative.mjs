// Aleo SDK Deployment with Alternative RPC
import { Account, AleoNetworkClient, ProgramManager, AleoKeyProvider } from '@provablehq/sdk';
import { readFileSync } from 'fs';

async function deploy() {
    try {
        console.log('🚀 Starting deployment with ALTERNATIVE RPC endpoint...\n');

        // Try multiple endpoints
        const endpoints = [
            'https://testnet3.aleorpc.com',
            'https://api.explorer.provable.com/v1',
            'https://testnet-aleo.lavenderfive.com:443'
        ];

        const privateKey = 'APrivateKey1zkp39dzxgoz6d3hMFE9BSB9uJTLyMVbrHk8Ad5vfzZ7XNu5';
        const account = new Account({ privateKey });
        console.log(`✅ Account: ${account.address().toString()}\n`);

        // Read program
        const programCode = readFileSync('D:\\buildathon\\encrypted-social-aleo\\leo\\group_manager\\build\\main.aleo', 'utf8');
        console.log(`✅ Loaded program (${(programCode.length / 1024).toFixed(2)} KB)\n`);

        // Try each endpoint
        for (const endpoint of endpoints) {
            console.log(`🔄 Trying endpoint: ${endpoint}`);

            try {
                const keyProvider = new AleoKeyProvider();
                keyProvider.useCache(true);

                const programManager = new ProgramManager(
                    endpoint,
                    keyProvider,
                    undefined
                );
                programManager.setAccount(account);

                const fee = 3000000; // 3 credits
                console.log(`   Broadcasting with ${fee / 1000000} credits fee...`);

                const txId = await programManager.deploy(programCode, fee, undefined, {
                    timeout: 120000 // 2 minute timeout
                });

                console.log(`\n🎉 SUCCESS with ${endpoint}!`);
                console.log(`   Transaction ID: ${txId}`);
                console.log(`   Explorer: https://explorer.aleo.org/transaction/${txId}`);

                return txId;

            } catch (error) {
                console.log(`   ❌ Failed: ${error.message}`);
                console.log(`   Trying next endpoint...\n`);
                continue;
            }
        }

        console.error('\n❌ All endpoints failed!');
        process.exit(1);

    } catch (error) {
        console.error('\n❌ Deployment error:');
        console.error(error.message);
        process.exit(1);
    }
}

deploy();
