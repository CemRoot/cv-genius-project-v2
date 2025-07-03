# CVGenius - AI-Powered CV Builder Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/CONTRIBUTING.md)

🚀 **Production-Ready** | 🔒 **Secure Admin Panel** | 🤖 **AI-Powered** | 📱 **Mobile-First**

CVGenius is a privacy-first, AI-powered CV builder platform with comprehensive admin dashboard. Features advanced security, multi-template support, and AI-powered optimization for global job markets.

🌐 **Live Demo**: [https://cvgenius-one.vercel.app](https://cvgenius-one.vercel.app)

## ✨ Key Features

### 🎯 Core Features
- **🤖 AI-Powered Optimization** - Smart suggestions using Google Gemini 2.0 Flash
- **🔒 Privacy-First Architecture** - No user accounts, no tracking, data stays local
- **📄 ATS-Friendly Templates** - 6+ professional templates optimized for Applicant Tracking Systems
- **🌍 Global Market Focus** - Tailored for international candidates (Ireland/Dublin specialty)
- **📱 Mobile-First PWA** - Full offline capabilities and mobile optimization
- **📊 Real-time Preview** - Live CV preview as you build
- **💾 Multiple Export Options** - PDF, DOCX, and plain text formats

### 🔐 Advanced Admin Panel
- **🛡️ Multi-Layer Security** - JWT + 2FA + IP Whitelisting + CSRF Protection
- **📊 Security Audit System** - Encrypted login tracking and analytics
- **🔧 AI Settings Management** - Context-specific AI model configuration
- **📝 Prompt Management** - Dynamic AI prompt templates
- **💰 Ad Management** - Comprehensive monetization controls
- **🔄 Vercel Integration** - Production environment synchronization
- **📈 Analytics Dashboard** - Real-time usage statistics

### 🎨 Advanced CV Features
- **🎨 6+ Professional Templates** - Industry-specific designs
- **🔄 Section Reordering** - Drag-and-drop customization
- **📱 Mobile CV Upload** - Upload and analyze existing CVs
- **🎯 Smart Cover Letters** - AI-powered personalized cover letters
- **🔍 ATS Analysis** - Score and optimize for applicant tracking systems
- **🌐 Multi-language Support** - Optimized for different markets

## 🚀 Quick Setup Guide

### Prerequisites
- **Node.js 18+** (recommended: 20.x)
- **npm 9+** (or yarn/pnpm)
- **Google Gemini API Key** (free tier: 1,500 requests/day)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/cv-genius-project-v2.git
cd cv-genius-project-v2
npm install
```

### 2. Environment Setup
```bash
# Copy template and configure
cp .env.example .env.local
```

**🔑 Required Environment Variables:**
```env
# AI Configuration (Required)
GOOGLE_AI_API_KEY=your_gemini_api_key_here

# Admin Security (Required for admin panel)
ADMIN_USERNAME=admin
ADMIN_PWD_HASH_B64=your_bcrypt_hash_base64_encoded
JWT_SECRET=your-256-bit-secret-key
ADMIN_IP_WHITELIST=127.0.0.1,::1,localhost

# Security Audit (Required for admin)
AUDIT_ENCRYPTION_KEY=your-32-character-encryption-key
```

### 3. Generate Admin Credentials
```bash
# Generate secure password hash
node -e "
const bcrypt = require('bcryptjs');
const password = 'your-secure-password';
const hash = bcrypt.hashSync(password, 10);
const base64 = Buffer.from(hash).toString('base64');
console.log('ADMIN_PWD_HASH_B64=' + base64);
"

# Generate JWT secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate audit encryption key
node -e "console.log('AUDIT_ENCRYPTION_KEY=' + require('crypto').randomBytes(16).toString('hex'))"
```

### 4. Start Development
```bash
npm run dev
# Open http://localhost:3000
# Admin panel: http://localhost:3000/admin
```

## 🔒 Security Features

### 🛡️ Multi-Layer Admin Security
- **JWT Authentication** - 2-hour tokens with refresh capability
- **Two-Factor Authentication** - TOTP support with QR setup
- **IP Whitelisting** - Restrict admin access by IP
- **CSRF Protection** - Token-based request validation
- **Rate Limiting** - Prevent brute force attacks
- **Encrypted Audit Logs** - AES-256-CBC encrypted activity tracking
- **Auto-Session Recovery** - Smart CSRF token restoration

### 🔐 Admin Panel Access
1. **Initial Setup**: First login creates 2FA setup
2. **Multi-Factor Auth**: Password + 2FA token required
3. **Session Management**: Auto-logout with activity tracking
4. **IP Security**: Configurable IP whitelist
5. **Audit Trail**: All actions logged and encrypted

## 🏗️ Architecture & Tech Stack

### 💻 Core Technologies
- **Next.js 15.3.4** - App Router with TypeScript
- **Tailwind CSS + shadcn/ui** - Modern styling system
- **Google Gemini 2.0 Flash** - AI-powered content generation
- **Zustand** - Lightweight state management
- **React Hook Form + Zod** - Form handling and validation

### 🔧 Security & Infrastructure
- **jose** - JWT token management
- **bcryptjs** - Password hashing
- **speakeasy** - TOTP 2FA implementation
- **@react-pdf/renderer** - PDF generation
- **docx** - DOCX export functionality

### 📊 Admin & Analytics
- **Encrypted audit logging** - Security event tracking
- **Vercel API integration** - Environment synchronization
- **Rate limiting** - In-memory (upgradeable to Redis)
- **Real-time security monitoring** - Live admin dashboard

## 📂 Project Structure

```
cv-genius-project-v2/
├── 🔐 src/app/admin/              # Secure admin panel
│   ├── components/                # Admin UI components
│   └── page.tsx                   # Main admin dashboard
├── 🛡️ src/app/api/admin/          # Protected admin APIs
│   ├── auth/                      # Authentication system
│   ├── audit/                     # Security audit system
│   ├── settings/                  # AI configuration
│   └── 2fa/                       # Two-factor auth
├── 🤖 src/app/api/ai/             # AI-powered endpoints
├── 🏗️ src/app/builder/           # CV builder application
├── 💌 src/app/cover-letter/       # Cover letter generator
├── 🧩 src/components/             # Reusable components
├── 🔧 src/lib/                    # Utilities & integrations
├── 🗄️ src/store/                  # State management
└── 📋 src/types/                  # TypeScript definitions
```

## 🚀 Deployment & Production

### 🌐 Vercel Deployment (Recommended)
1. **Connect Repository**: Link GitHub repo to Vercel
2. **Environment Variables**: Add all required env vars in Vercel dashboard
3. **Domain Setup**: Configure custom domain (optional)
4. **Admin Security**: Update IP whitelist for production IPs

### 🔐 Production Security Checklist
- [ ] Change default admin credentials
- [ ] Configure production IP whitelist
- [ ] Set strong JWT secret (256-bit minimum)
- [ ] Enable 2FA for admin accounts
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy for audit logs
- [ ] Test all security features in staging

### 📊 Environment Variables Reference
See `.env.example` for complete configuration template with security notes.

## 👥 Contributing

### 🔧 Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow code style guidelines
4. Test thoroughly (especially admin security features)
5. Submit pull request with detailed description

### 🧪 Testing Admin Features
```bash
# Test admin login
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'

# Test 2FA setup
# Access /admin and follow 2FA setup wizard
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Issues

- **🐛 Bug Reports**: Use GitHub Issues with detailed reproduction steps
- **💡 Feature Requests**: Open GitHub Issues with enhancement label
- **🔒 Security Issues**: Email security concerns privately
- **📚 Documentation**: Check `/docs` folder for detailed guides

## 📚 Documentation

All project documentation is organized in the `/docs` directory:

- **[Setup & Configuration](docs/setup/)** - Gemini AI, 2FA, and environment setup
- **[Deployment Guides](docs/deployment/)** - Vercel deployment and production setup
- **[Security Documentation](docs/security/)** - Security policies and audit reports
- **[Development Guides](docs/)** - Contributing, testing, and workflow guides
- **[Feature Documentation](docs/features/)** - Detailed feature documentation
- **[Technical Specs](docs/technical/)** - Technical specifications and architecture
- **[Scripts Documentation](scripts/README.md)** - Utility scripts and tools

## ⚠️ Important Security Notes

1. **🚨 NEVER commit `.env.local` or auth files**
2. **🔐 Use strong, unique passwords and secrets**
3. **🔄 Rotate admin credentials regularly**
4. **📍 Restrict admin access to known IPs only**
5. **👁️ Monitor audit logs for suspicious activity**
6. **🔒 Keep dependencies updated for security patches**

---

## 🎯 Quick Links

- **🏠 Demo**: [Live Demo](https://cvgenius-one.vercel.app)
- **👨‍💼 Admin Panel**: [Admin Dashboard](https://cvgenius-one.vercel.app/admin)
- **📋 Contributing**: [Contributing Guide](docs/CONTRIBUTING.md)
- **🔒 Security**: [Security Policy](docs/SECURITY.md)
- **📜 License**: [MIT License](LICENSE)