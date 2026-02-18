import { Account, ProgramManager, AleoKeyProvider, NetworkRecordProvider, AleoNetworkClient } from '@provablehq/sdk/testnet.js';
import { readFileSync } from 'fs';

const PRIVATE_KEY = 'APrivateKey1zkp39dzxgoz6d3hMFE9BSB9uJTLyMVbrHk8Ad5vfzZ7XNu5';
const ENDPOINT = 'https://api.explorer.provable.com/v1';

// tip_receipt.aleo has NO credits.aleo import - much faster to prove
const programCode = readFileSync('./leo/tip_receipt/build/main.aleo', 'utf-8');
console.log('Program size:', programCode.length, 'chars');
console.log('Program preview:', programCode.slice(0, 80));

const account = new Account({ privateKey: PRIVATE_KEY });
console.log('Account:', account.address().to_string());

const networkClient = new AleoNetworkClient(ENDPOINT);
const keyProvider = new AleoKeyProvider();
keyProvider.useCache(true);
const recordProvider = new NetworkRecordProvider(account, networkClient);

const pm = new ProgramManager(ENDPOINT, keyProvider, recordProvider);
pm.setAccount(account);

try {
  console.log('Deploying tip_receipt.aleo (no credits import, ~3 credits)...');
  const txId = await pm.deploy(programCode, 3.0);
  console.log('SUCCESS! TX ID:', txId);
} catch(e) {
  console.error('Deploy failed:', (e.message || String(e)).slice(0, 500));
}
