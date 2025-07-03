#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('🔧 2FA Issue Resolver\n');
  
  // Load current state
  const stateFile = path.join(__dirname, '.2fa-state.json');
  let currentState = { secret: null, enabled: false };
  
  try {
    if (fs.existsSync(stateFile)) {
      currentState = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading state:', error);
  }
  
  console.log('Current 2FA State:');
  console.log('- Enabled:', currentState.enabled);
  console.log('- Has Secret:', !!currentState.secret);
  console.log('- Last Updated:', currentState.lastUpdated || 'Unknown');
  
  console.log('\nOptions:');
  console.log('1. Disable 2FA (allows login without 2FA code)');
  console.log('2. Show current 2FA secret (if exists)');
  console.log('3. Set a new 2FA secret manually');
  console.log('4. Exit');
  
  const choice = await question('\nSelect an option (1-4): ');
  
  switch (choice) {
    case '1':
      // Disable 2FA
      const resetState = {
        secret: null,
        enabled: false,
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(stateFile, JSON.stringify(resetState, null, 2));
      console.log('\n✅ 2FA has been disabled!');
      console.log('You can now login without a 2FA code.');
      break;
      
    case '2':
      // Show current secret
      if (currentState.secret) {
        console.log('\n🔑 Current 2FA Secret:', currentState.secret);
        console.log('You can use this to re-add the account to your authenticator app.');
      } else {
        console.log('\n⚠️  No 2FA secret found!');
      }
      break;
      
    case '3':
      // Set new secret
      const newSecret = await question('\nEnter the 2FA secret from your authenticator app: ');
      if (newSecret && newSecret.length > 0) {
        const newState = {
          secret: newSecret.trim(),
          enabled: true,
          lastUpdated: new Date().toISOString()
        };
        fs.writeFileSync(stateFile, JSON.stringify(newState, null, 2));
        console.log('\n✅ New 2FA secret has been set!');
      } else {
        console.log('\n❌ Invalid secret provided.');
      }
      break;
      
    case '4':
      console.log('\nExiting...');
      break;
      
    default:
      console.log('\n❌ Invalid option selected.');
  }
  
  rl.close();
}

main().catch(console.error);