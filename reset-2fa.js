const fs = require('fs');
const path = require('path');

// Reset 2FA state
const stateFile = path.join(__dirname, '.2fa-state.json');

const resetState = {
  secret: null,
  enabled: false,
  lastUpdated: new Date().toISOString()
};

try {
  fs.writeFileSync(stateFile, JSON.stringify(resetState, null, 2));
  console.log('✅ 2FA has been reset successfully!');
  console.log('📝 New state:', resetState);
  console.log('\nYou can now login without 2FA and set it up again if needed.');
} catch (error) {
  console.error('❌ Error resetting 2FA:', error);
}