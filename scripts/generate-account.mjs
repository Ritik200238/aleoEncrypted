import { Account } from '@provablehq/sdk';

console.log('\n🔐 === GENERATING ALEO TESTNET ACCOUNT ===\n');

const account = new Account();

console.log('PRIVATE KEY:', account.privateKey().to_string());
console.log('ADDRESS:', account.address().to_string());

console.log('\n⚠️  CRITICAL: SAVE THESE CREDENTIALS IMMEDIATELY! ⚠️');
console.log('\n📋 Next Steps:');
console.log('1. Copy both values above and save them securely');
console.log('2. Go to https://faucet.aleo.org');
console.log('3. Paste your ADDRESS and request testnet credits');
console.log('4. Wait ~30 seconds for credits to arrive');
console.log('5. Run deployment:');
console.log('   $env:ALEO_PRIVATE_KEY="<your_private_key>"');
console.log('   node deploy-all-contracts.mjs');
console.log('\n✅ You need ~10 Aleo credits for deploying all 4 contracts\n');
