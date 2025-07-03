#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode-terminal');
const readline = require('readline');

const STATE_FILE = path.join(process.cwd(), '.2fa-state.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('🔐 2FA Sync Fix Tool');
  console.log('====================\n');

  // Read current state
  let currentState = {
    secret: null,
    enabled: false,
    lastUpdated: new Date().toISOString()
  };

  if (fs.existsSync(STATE_FILE)) {
    const data = fs.readFileSync(STATE_FILE, 'utf8');
    currentState = JSON.parse(data);
    console.log('Current 2FA State:');
    console.log(`  Enabled: ${currentState.enabled}`);
    console.log(`  Has Secret: ${currentState.secret ? 'Yes' : 'No'}`);
    console.log(`  Last Updated: ${currentState.lastUpdated}`);
  }

  console.log('\nOptions:');
  console.log('1. Disable 2FA completely (if you want to login without 2FA)');
  console.log('2. Generate new 2FA setup (if you want to re-setup Google Authenticator)');
  console.log('3. Enter existing secret (if you have the secret key)');
  console.log('4. Test 2FA token (if 2FA is already set up)');
  console.log('5. Exit');

  const choice = await question('\nEnter your choice (1-5): ');

  switch (choice) {
    case '1':
      // Disable 2FA
      currentState.enabled = false;
      currentState.secret = null;
      currentState.lastUpdated = new Date().toISOString();
      fs.writeFileSync(STATE_FILE, JSON.stringify(currentState, null, 2));
      console.log('\n✅ 2FA has been disabled. You can now login with just username and password.');
      break;

    case '2':
      // Generate new 2FA setup
      const secret = speakeasy.generateSecret({
        name: 'CV Genius Admin',
        issuer: 'CV Genius',
        length: 32
      });

      console.log('\n📱 New 2FA Setup');
      console.log('================\n');
      console.log('Secret Key (save this):', secret.base32);
      console.log('\nQR Code (scan with Google Authenticator):');
      qrcode.generate(secret.otpauth_url, { small: true });

      const confirmSetup = await question('\nDo you want to enable this 2FA setup? (yes/no): ');
      
      if (confirmSetup.toLowerCase() === 'yes') {
        // Test verification first
        const testToken = await question('\nEnter a 6-digit code from Google Authenticator to verify: ');
        
        const verified = speakeasy.totp.verify({
          secret: secret.base32,
          encoding: 'base32',
          token: testToken,
          window: 2
        });

        if (verified) {
          currentState.enabled = true;
          currentState.secret = secret.base32;
          currentState.lastUpdated = new Date().toISOString();
          fs.writeFileSync(STATE_FILE, JSON.stringify(currentState, null, 2));
          console.log('\n✅ 2FA has been successfully enabled!');
        } else {
          console.log('\n❌ Invalid token. 2FA setup cancelled.');
        }
      }
      break;

    case '3':
      // Enter existing secret
      const existingSecret = await question('\nEnter your existing secret key: ');
      const testExistingToken = await question('Enter a 6-digit code to verify: ');
      
      const verifyExisting = speakeasy.totp.verify({
        secret: existingSecret,
        encoding: 'base32',
        token: testExistingToken,
        window: 2
      });

      if (verifyExisting) {
        currentState.enabled = true;
        currentState.secret = existingSecret;
        currentState.lastUpdated = new Date().toISOString();
        fs.writeFileSync(STATE_FILE, JSON.stringify(currentState, null, 2));
        console.log('\n✅ 2FA has been successfully synced!');
      } else {
        console.log('\n❌ Invalid token. Secret not saved.');
      }
      break;

    case '4':
      // Test 2FA token
      if (!currentState.secret) {
        console.log('\n❌ No 2FA secret found. Please set up 2FA first.');
      } else {
        const testToken = await question('\nEnter your 6-digit 2FA code: ');
        
        // Show current time for debugging
        console.log('\nDebug Info:');
        console.log('  Server Time:', new Date().toISOString());
        console.log('  Secret (first 4 chars):', currentState.secret.substring(0, 4) + '...');
        
        const verified = speakeasy.totp.verify({
          secret: currentState.secret,
          encoding: 'base32',
          token: testToken,
          window: 2
        });

        if (verified) {
          console.log('  Result: ✅ Token is VALID');
        } else {
          console.log('  Result: ❌ Token is INVALID');
          
          // Generate current valid token for comparison
          const currentToken = speakeasy.totp({
            secret: currentState.secret,
            encoding: 'base32'
          });
          console.log('  Expected token (current time):', currentToken);
        }
      }
      break;

    case '5':
      console.log('\nExiting...');
      break;

    default:
      console.log('\n❌ Invalid choice');
  }

  rl.close();
}

main().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});