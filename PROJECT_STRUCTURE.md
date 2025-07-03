# CV Genius Project Structure

## 📁 Directory Organization

```
cv-genius-project-v2/
├── 📄 Core Files (Root)
│   ├── README.md          # Project overview and quick start
│   ├── LICENSE            # MIT License
│   ├── package.json       # Node.js dependencies
│   ├── next.config.js     # Next.js configuration
│   ├── tailwind.config.ts # Tailwind CSS configuration
│   ├── tsconfig.json      # TypeScript configuration
│   └── vercel.json        # Vercel deployment settings
│
├── 📚 docs/               # All documentation
│   ├── README.md          # Documentation index
│   ├── setup/             # Setup and configuration guides
│   ├── deployment/        # Deployment documentation
│   ├── security/          # Security policies and audits
│   ├── features/          # Feature documentation
│   ├── technical/         # Technical specifications
│   └── api/               # API documentation
│
├── 🔧 scripts/            # Utility scripts
│   ├── README.md          # Scripts documentation
│   ├── admin/             # Admin-related scripts
│   ├── *-2fa-*.js         # 2FA management scripts
│   ├── generate-*.js      # Generation utilities
│   └── deploy-*.sh        # Deployment scripts
│
├── 🎨 src/                # Source code
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   ├── styles/            # CSS and style files
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
│
├── 🌐 public/             # Static assets
│   ├── icons/             # App icons
│   ├── images/            # Images
│   ├── templates/         # CV templates
│   └── *.js               # Service workers
│
├── 📊 data/               # Data files
│   ├── admin-*.json       # Admin configuration
│   └── *-prompts.json     # AI prompt templates
│
└── 🧪 tests/              # Test files
    ├── e2e/               # End-to-end tests
    └── unit/              # Unit tests
```

## 🔍 Quick Navigation

### For Developers
- **Getting Started**: [`README.md`](README.md)
- **Contributing**: [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md)
- **Development Workflow**: [`docs/DEVELOPMENT_WORKFLOW.md`](docs/DEVELOPMENT_WORKFLOW.md)

### For Deployment
- **Vercel Setup**: [`docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md`](docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md)
- **Environment Setup**: [`docs/setup/`](docs/setup/)
- **Deployment Scripts**: [`scripts/deploy-*.sh`](scripts/)

### For Security
- **Security Policy**: [`docs/SECURITY.md`](docs/SECURITY.md)
- **Audit Reports**: [`docs/security/`](docs/security/)
- **2FA Setup**: [`docs/setup/VERCEL_2FA_SETUP.md`](docs/setup/VERCEL_2FA_SETUP.md)

### For Features
- **Admin Panel**: [`src/app/admin/`](src/app/admin/)
- **CV Builder**: [`src/app/builder/`](src/app/builder/)
- **AI Integration**: [`src/lib/ai/`](src/lib/ai/)

## 💡 Tips

1. **Documentation**: All docs are in `/docs` with proper categorization
2. **Scripts**: All utility scripts are in `/scripts` with a README
3. **Environment**: Use `.env.example` as a template for `.env.local`
4. **Security**: Never commit sensitive files (`.env.local`, auth files)
5. **Testing**: Run tests before pushing changes