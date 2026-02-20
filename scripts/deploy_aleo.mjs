import { Account, ProgramManager, AleoKeyProvider, NetworkRecordProvider, AleoNetworkClient } from '@provablehq/sdk/testnet.js';
import { readFileSync } from 'fs';

const PRIVATE_KEY = 'APrivateKey1zkp39dzxgoz6d3hMFE9BSB9uJTLyMVbrHk8Ad5vfzZ7XNu5';
// SDK adds /testnet automatically, so base URL should NOT include /testnet
const ENDPOINT = 'https://api.explorer.provable.com/v1';

const programCode = readFileSync('./leo/private_tips/build/main.aleo', 'utf-8');

const account = new Account({ privateKey: PRIVATE_KEY });
console.log('Account:', account.address().to_string());

const networkClient = new AleoNetworkClient(ENDPOINT);
const keyProvider = new AleoKeyProvider();
keyProvider.useCache(true);
const recordProvider = new NetworkRecordProvider(account, networkClient);

const pm = new ProgramManager(ENDPOINT, keyProvider, recordProvider);
pm.setAccount(account);

try {
  console.log('Starting deploy of private_tips.aleo...');
  const txId = await pm.deploy(programCode, 4.8);
  console.log('SUCCESS! TX ID:', txId);
} catch(e) {
  console.error('Deploy failed:', e.message?.slice(0, 300) || String(e).slice(0, 300));
}
