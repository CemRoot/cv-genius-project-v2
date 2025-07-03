# CV Genius Scripts

This directory contains utility scripts for managing and maintaining the CV Genius application.

## 📁 Directory Structure

### Admin Scripts (`admin/`)
- `admin-access-generator.js` - Generate admin access credentials

### Authentication & Security
- `generate-password-hash.js` - Generate bcrypt password hashes for admin authentication
- `check-admin-setup.js` - Verify admin authentication configuration
- `reset-admin-password.js` - Reset admin password
- `hash-generator.js` - General purpose hash generator

### 2FA Management
- `fix-2fa-sync.js` - Fix 2FA synchronization issues
- `test-vercel-2fa.js` - Test Vercel 2FA configuration
- `fix-2fa-issue.js` - General 2FA troubleshooting
- `reset-2fa.js` - Reset 2FA settings
- `test-2fa-debug.js` - Debug 2FA issues

### Deployment & Updates
- `deploy-production.sh` - Production deployment script
- `dev-reset.sh` - Reset development environment
- `update-ai-endpoints-auth.js` - Update AI endpoint authentication
- `update-ai-endpoints-auth.ts` - TypeScript version of endpoint updater

## 🔧 Usage Examples

### Generate Admin Password Hash
```bash
node scripts/generate-password-hash.js "YourSecurePassword"
```

### Check Admin Setup
```bash
node scripts/check-admin-setup.js
```

### Test 2FA Configuration
```bash
node scripts/test-vercel-2fa.js
```

### Fix 2FA Sync Issues
```bash
node scripts/fix-2fa-sync.js
```

### Deploy to Production
```bash
./scripts/deploy-production.sh
```

## ⚠️ Important Notes

1. **Security**: Many of these scripts handle sensitive data. Never commit credentials or secrets.
2. **Environment**: Some scripts require specific environment variables to be set.
3. **Permissions**: Deployment scripts may require execute permissions: `chmod +x script.sh`
4. **Dependencies**: Ensure all Node.js dependencies are installed before running scripts.

## 🔐 Required Environment Variables

For admin and authentication scripts:
- `JWT_SECRET` - JWT secret for token generation
- `ADMIN_USERNAME` - Admin username
- `ADMIN_PWD_HASH_B64` - Base64 encoded bcrypt password hash
- `ADMIN_2FA_STATE` - 2FA configuration state (for Vercel)

## 📝 Adding New Scripts

When adding new scripts:
1. Place them in the appropriate subdirectory
2. Add clear comments and usage instructions
3. Update this README with the new script description
4. Ensure proper error handling and validation