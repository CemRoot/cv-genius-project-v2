# CVGenius - AI-Powered CV Builder for Global Market

CVGenius is a privacy-first, AI-powered CV builder platform designed for international job seekers. Create professional, ATS-friendly CVs with no signup required, optimized for global markets including Ireland/Dublin.

## 🌟 Key Features

- **AI-Powered Optimization** - Smart suggestions using Google Gemini 2.0 Flash
- **Privacy-First Architecture** - No user accounts, no tracking, data stays local
- **ATS-Friendly Templates** - Optimized for Applicant Tracking Systems
- **Global Market Focus** - Tailored for international candidates
- **Multiple Professional Templates** - 6+ templates for different industries
- **Real-time Preview** - See your CV as you build it
- **Export Options** - PDF, DOCX, and plain text formats
- **AI Cover Letter Generator** - 6 professional templates with AI assistance
- **Mobile-First Design** - PWA support with offline capabilities
- **Admin Panel** - Content management and analytics dashboard
- **Comprehensive CV Sections** - All standard CV sections including Projects, Certifications, Languages, Interests, and References
- **Section Reordering** - Customize the order of CV sections
- **Mobile CV Upload** - Upload and analyze existing CVs from mobile devices
- **404 Error Pages** - Custom 404 pages with helpful navigation

## 🚀 Quick Start for Developers

### Prerequisites

- **Node.js** 18.x or higher (recommended: 20.x)
- **npm** 9.x or higher (or yarn/pnpm equivalent)
- **Google Gemini API Key** (free tier available)

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-username/cv-genius-project-v2.git
cd cv-genius-project-v2

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local
```

**Edit `.env.local` with your configuration:**

```env
# Required: Google Gemini AI API Key
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_gemini_api_key_here

# Optional: Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=CV Genius

# Optional: Analytics (leave empty for development)
NEXT_PUBLIC_ADSENSE_CLIENT=
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=

# Development Settings
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=development
```

### 3. Get Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in your `.env.local` file
5. **Free tier includes**: 1,500 requests per day (sufficient for development)

### 4. Start Development Server

```bash
# Start development server
npm run dev

# Alternative: Start with Turbopack (faster)
npm run dev:turbo

# Alternative: Start on different port
npm run dev:port
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠 Available Scripts

```bash
npm run dev           # Start development server
npm run dev:turbo     # Start with Turbopack (faster builds)
npm run dev:port      # Start on port 3001
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run type-check    # TypeScript type checking
npm run clean         # Clean build cache
```

## 🏗 Tech Stack

- **Framework**: Next.js 15.3.4 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.4 + shadcn/ui components
- **AI Integration**: Google Gemini 2.0 Flash API
- **State Management**: Zustand 5.x
- **Form Handling**: React Hook Form + Zod validation
- **PDF Generation**: @react-pdf/renderer 4.x
- **DOCX Export**: docx 9.x
- **Animations**: Framer Motion 12.x
- **Icons**: Lucide React
- **Performance**: Vercel Speed Insights
- **Drag & Drop**: @dnd-kit/sortable for section reordering

## 📂 Project Structure

```
src/
├── app/                     # Next.js App Router pages
│   ├── admin/              # Admin panel routes
│   ├── api/                # API routes
│   │   ├── ai/            # AI-powered endpoints
│   │   ├── admin/         # Admin authentication & management
│   │   └── ats/           # ATS analysis endpoints
│   ├── builder/           # CV builder application
│   ├── cover-letter/      # Cover letter generator
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components (shadcn/ui)
│   ├── layout/            # Navigation, footer, layout
│   ├── cv/                # CV builder components
│   ├── forms/             # Form components
│   ├── ads/               # Monetization components
│   ├── mobile/            # Mobile-optimized components
│   └── export/            # PDF/DOCX export components
├── lib/
│   ├── ai/                # AI prompt management
│   ├── integrations/      # Third-party integrations
│   └── utils.ts           # Utility functions
├── store/                 # Zustand stores
├── types/                 # TypeScript definitions
└── hooks/                 # Custom React hooks
```

## 🔧 Development Workflow

### Local Development Setup

1. **Hot Reload**: Changes auto-refresh in development
2. **Type Checking**: Run `npm run type-check` for TypeScript validation
3. **Linting**: Run `npm run lint` for code quality checks
4. **Clean Build**: Use `npm run clean` if you encounter cache issues

### Common Development Issues & Solutions

#### 1. Webpack Module Not Found Errors
```bash
# Full cache clearing solution
pkill -f "next dev"
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

#### 2. Build Errors
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

#### 3. TypeScript Errors
```bash
# Check types without building
npm run type-check
```

#### 4. API Key Issues
- Verify `.env.local` exists with correct variable names
- Check API key is active in Google AI Studio
- Ensure no extra spaces or quotes around the key

### Testing AI Features

1. **CV Analysis**: Upload a sample PDF in `/builder`
2. **Cover Letter**: Complete the flow in `/cover-letter`
3. **ATS Check**: Test ATS analysis in `/ats-check`

## 🔒 Security Configuration

### Admin Panel Security

**IMPORTANT**: Before deploying to production, ensure proper admin credentials:

1. **Generate secure admin password hash**:
```bash
echo -n "your-secure-password" | openssl dgst -sha256
```

2. **Set environment variables**:
```bash
ADMIN_USERNAME=your_secure_username
ADMIN_PASSWORD_HASH=generated_hash_from_step_1
JWT_SECRET=generate_32_char_random_string
```

3. **NEVER commit credentials to version control**
4. **Use strong, unique passwords**
5. **Enable 2FA after first login**

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**:
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

2. **Connect to Vercel**:
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Auto-detects Next.js configuration

3. **Set Environment Variables** in Vercel Dashboard:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_production_api_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

4. **Deploy**: Click "Deploy" - your app will be live!

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔐 Admin Panel Access

The application includes an admin panel for content management:

- **URL**: `/admin`
- **Features**: Prompt management, analytics, user activity
- **Authentication**: JWT-based with 2FA support
- **Security**: Rate limiting, IP whitelist, CSRF protection

*Note: Admin setup requires additional configuration in production.*

## 🎨 Customization

### Adding New CV Templates

1. Create template component in `src/components/cv/templates/`
2. Export from the templates index file
3. Add template metadata to the templates list

### Modifying AI Prompts

Update prompts in `src/lib/ai/global-prompts.ts` to customize AI behavior:

```typescript
export const GLOBAL_PROMPTS = {
  analyzeCv: "Your custom prompt here...",
  generateCoverLetter: "Your custom prompt here..."
}
```

### Styling Customization

- **Colors**: Edit `tailwind.config.ts` for brand colors
- **Components**: Modify components in `src/components/ui/`
- **Global Styles**: Update `src/app/globals.css`

## 📊 Monitoring & Analytics

- **Performance**: Vercel Speed Insights integrated
- **Privacy**: No user tracking, GDPR compliant
- **Monetization**: Google AdSense ready (optional)
- **Error Tracking**: Console error filtering implemented

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**:
```bash
npm run dev:port  # Uses port 3001
```

2. **Build Failures**:
```bash
npm run clean
npm install
```

3. **API Not Working**:
- Check `.env.local` file exists
- Verify Gemini API key is valid
- Check network connectivity

4. **Mobile Issues**:
- Test on mobile devices or browser dev tools
- Check PWA manifest in `/public/manifest.json`

### Performance Optimization

- Uses Turbopack for faster development builds
- Optimized package imports for Lucide React
- Browser source maps disabled to reduce 404 warnings
- Font preloading for better performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes following the existing code style
4. Test your changes locally
5. Submit a pull request

### Development Guidelines

- Use TypeScript for all new code
- Follow existing component patterns
- Add proper error handling
- Test on mobile devices
- Update documentation as needed

## 📄 License

MIT License - Open source project made with ❤️ for the global developer community.

## 🔗 Useful Links

- **Google Gemini API**: [Get API Key](https://makersuite.google.com/app/apikey)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel Deployment**: [vercel.com](https://vercel.com)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com)
- **shadcn/ui Components**: [ui.shadcn.com](https://ui.shadcn.com)

## 🆘 Support

- **GitHub Issues**: For bugs and feature requests
- **Documentation**: Check `/docs` folder for detailed guides
- **Community**: Join our developer community for support

---

**CVGenius** - Empowering global talent with AI-powered career tools! 🌍✨

## Recent Updates (2025)

### ✅ Major Features & Fixes Completed

- **Complete CV Builder Overhaul**: Enhanced multi-step form with 10 comprehensive sections
- **All CV Sections Added**: Personal Info, Summary, Experience, Education, Skills, Projects, Certifications, Languages, Interests, and References
- **Section Reordering**: Dynamic section management with drag-and-drop reordering capability
- **Classic Template Improvements**: Black and white professional design optimized for ATS
- **Mobile Responsive Builder**: Split-view design with mobile-optimized tab navigation
- **Custom 404 Error Pages**: All error pages now feature consistent design with navigation
- **Template Gallery**: Fixed template rendering and preview functionality
- **Cover Letter PDF Export**: Fixed blue highlighting and font rendering issues
- **Name Display Bug**: Fixed "John Doe" placeholder appearing instead of user names
- **Cache Management**: Implemented webpack cache clearing solutions
- **Mobile Optimization**: Enhanced mobile PDF export capabilities
- **Admin Security**: JWT authentication with 2FA support implemented

### 🚀 New Components Added

- **SectionReorderPanel**: `/src/components/cv/section-reorder-panel.tsx` - Drag-and-drop section management
- **Form Components**: Added CertificationsForm, LanguagesForm, InterestsForm, and ReferencesForm
- **Mobile-First Forms**: All forms optimized for mobile with proper spacing and validation

### 🔄 Current Status

All core features are production-ready with comprehensive error handling and user experience optimization. The CV builder now supports all standard CV sections with optional fields that can be skipped if not needed.