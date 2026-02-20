// Deploy 3 contracts to Aleo Testnet
// Budget: 20 credits | Cost: ~15.5 credits for 3 contracts
import { Account, AleoNetworkClient, ProgramManager, AleoKeyProvider } from '@provablehq/sdk';
import { readFileSync, writeFileSync } from 'fs';

const PRIVATE_KEY = 'APrivateKey1zkp39dzxgoz6d3hMFE9BSB9uJTLyMVbrHk8Ad5vfzZ7XNu5';
const ENDPOINT = 'https://api.explorer.provable.com/v1';

const CONTRACTS = [
    { name: 'membership_proof', path: 'leo/membership_proof/build/main.aleo', fee: 5100000 },
    { name: 'group_manager', path: 'leo/group_manager/build/main.aleo', fee: 5600000 },
    { name: 'message_handler', path: 'leo/message_handler/build/main.aleo', fee: 5900000 },
];

async function checkProgram(networkClient, name) {
    try {
        await networkClient.getProgram(`${name}.aleo`);
        return true;
    } catch { return false; }
}

async function main() {
    console.log('EncryptedSocial - Deploying 3 contracts to Aleo Testnet\n');

    const account = new Account({ privateKey: PRIVATE_KEY });
    console.log(`Account: ${account.address().toString()}`);

    const networkClient = new AleoNetworkClient(ENDPOINT);
    const keyProvider = new AleoKeyProvider();
    keyProvider.useCache(true);

    const programManager = new ProgramManager(ENDPOINT, keyProvider, undefined);
    programManager.setAccount(account);

    const results = [];

    for (const contract of CONTRACTS) {
        console.log(`\n--- Deploying ${contract.name}.aleo ---`);

        // Check if already deployed
        const exists = await checkProgram(networkClient, contract.name);
        if (exists) {
            console.log(`Already deployed! Skipping.`);
            results.push({ name: contract.name, status: 'already_deployed' });
            continue;
        }

        try {
            const code = readFileSync(contract.path, 'utf8');
            console.log(`Loaded: ${(code.length / 1024).toFixed(1)} KB | Fee: ${contract.fee / 1e6} credits`);

            console.log('Broadcasting...');
            const txId = await programManager.deploy(code, contract.fee);
            console.log(`TX: ${txId}`);
            results.push({ name: contract.name, status: 'broadcast', txId });

            // Wait between deployments
            if (contract !== CONTRACTS[CONTRACTS.length - 1]) {
                console.log('Waiting 45s for confirmation...');
                await new Promise(r => setTimeout(r, 45000));
            }
        } catch (err) {
            console.error(`Failed: ${err.message}`);
            results.push({ name: contract.name, status: 'failed', error: err.message });
        }
    }

    console.log('\n=== DEPLOYMENT RESULTS ===');
    writeFileSync('deployment-results.json', JSON.stringify({
        network: 'testnet',
        timestamp: new Date().toISOString(),
        deployer: account.address().toString(),
        contracts: results,
    }, null, 2));
    console.log(JSON.stringify(results, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
